import { parse, unparse } from 'papaparse'
import * as fs from 'fs'
import * as Path from 'path'
import * as _ from 'lodash'

import {
    USD_MERGED,
    TRANSFERWISE_KONTO,
    USD_VENDORS,
    USD_CUSTOMERS,
    BACKUP_EXCHANGE_RATE,
} from './config'
import { pick, get, mapKeys, sortBy } from 'lodash'

const formatter = new Intl.NumberFormat('de-DE', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})

run()
async function run() {
    console.log('1. Run')

    const { data, meta } = await parseFile()
    // console.log(meta)
    const cleanedKeys = trimKeys(data)
    const afterDuplicates = mergeDuplicates(cleanedKeys)
    const cleanedFromVendors = deleteVendorUnnecessary(afterDuplicates)
    const adjustedVendors = adjustVendorAmounts(cleanedFromVendors)
    const adjustedCustomers = adjustCustomerAmounts(adjustedVendors)
    const cleanedFromCustomers = deleteCustomerUnnecessary(adjustedCustomers)
    exportFile(cleanedFromCustomers)
}

type Keys =
    | 'Umsatz (ohne Soll/Haben-Kz)'
    | 'Konto'
    | 'Gegenkonto (ohne BU-Schlüssel)'
    | 'Belegfeld 1'
type Row = Record<Keys, string>

type ParseResult<T> = {
    data: T[]
    meta: any
}

function parseFile(): Promise<ParseResult<Row>> {
    console.log('PerseFile')
    const fileName = 'EXTF_Buchungsstapel_20190101_bis_20200101.csv'
    const filePath = Path.join(__dirname, `./data/${fileName}`)
    const readStream = fs.createReadStream(filePath)
    return new Promise((resolve, reject) => {
        parse<Row>(readStream, {
            header: true,
            complete: (results) => {
                resolve(results)
            },
            error: (err) => {
                reject(err)
            },
        })
    })
}

function trimKeys(data: Row[]): Row[] {
    return data.map((row) => mapKeys(row, (val, key) => key.trim()) as Row)
}

function mergeDuplicates(data: Row[]) {
    const counter: Record<string, number> = {}
    function increase(key: string) {
        if (!counter[key]) {
            counter[key] = 0
        }
        counter[key]++
    }
    const fromKeys = _.keys(USD_MERGED)
    const mapped = data.map((r: Row) => {
        if (fromKeys.includes(r.Konto)) {
            increase(r.Konto)
            const toReplaced = USD_MERGED[r.Konto]
            return {
                ...r,
                Konto: toReplaced,
            }
        } else if (fromKeys.includes(r['Gegenkonto (ohne BU-Schlüssel)'])) {
            increase(r['Gegenkonto (ohne BU-Schlüssel)'])
            const toReplaced = USD_MERGED[r['Gegenkonto (ohne BU-Schlüssel)']]
            return {
                ...r,
                'Gegenkonto (ohne BU-Schlüssel)': toReplaced,
            }
        }
        return r
    })

    console.log('Merged Result', counter)
    return mapped
}

function deleteVendorUnnecessary(data: Row[]) {
    const deleted: Row[] = []
    const result: Row[] = []
    data.forEach((r) => {
        if (
            r.Konto === TRANSFERWISE_KONTO &&
            USD_VENDORS.includes(r['Gegenkonto (ohne BU-Schlüssel)']) &&
            !r['Belegfeld 1']
        ) {
            deleted.push(r)
        } else {
            result.push(r)
        }
    })

    console.log('DeletedVendorUnnecessary', deleted.length, deleted.map(pickRelevant))

    return result
}

function adjustVendorAmounts(data: Row[]) {
    const changed: Array<[Row, Row]> = []
    const mapped = data.map((r: Row) => {
        if (
            r.Konto === TRANSFERWISE_KONTO &&
            USD_VENDORS.includes(r['Gegenkonto (ohne BU-Schlüssel)'])
        ) {
            const invoice = data.find(
                (d) => d.Konto !== TRANSFERWISE_KONTO && d['Belegfeld 1'] === r['Belegfeld 1']
            )
            if (!invoice) {
                throw new Error(`Could not find Invoice for ${r['Belegfeld 1']}`)
            }
            changed.push([r, invoice])
            return {
                ...r,
                'Umsatz (ohne Soll/Haben-Kz)': invoice['Umsatz (ohne Soll/Haben-Kz)'],
            }
        } else {
            return r
        }
    })

    console.log('AjustedVendorAmounts', changed.length, changed.map(mapChanged))
    return mapped
}

function adjustCustomerAmounts(data: Row[]) {
    const changed: Array<[Row, Row]> = []
    const mapped = data.map((r: Row) => {
        if (USD_CUSTOMERS.includes(r['Gegenkonto (ohne BU-Schlüssel)'])) {
            const openAmountRecord = data.filter(
                (d) =>
                    d['Konto'] === r['Gegenkonto (ohne BU-Schlüssel)'] &&
                    d['Gegenkonto (ohne BU-Schlüssel)'] === '8000' &&
                    d['Belegfeld 1'] === r['Belegfeld 1']
            )
            if (openAmountRecord.length === 0) {
                const newAmount =
                    parseNumber(r['Umsatz (ohne Soll/Haben-Kz)']) / BACKUP_EXCHANGE_RATE
                const adapted: Row = {
                    ...r,
                    'Umsatz (ohne Soll/Haben-Kz)': serializeNumber(newAmount),
                }
                changed.push([r, adapted])
                return adapted
            } else if (openAmountRecord.length !== 1) {
                throw Error(`Did find more or less open amount records ${openAmountRecord.length}`)
            }
            const openAmountRow = openAmountRecord[0]
            const newAmount =
                parseNumber(r['Umsatz (ohne Soll/Haben-Kz)']) -
                parseNumber(openAmountRow['Umsatz (ohne Soll/Haben-Kz)'])
            if (newAmount < 0) {
                return r
            }
            const updated = {
                ...r,
                'Umsatz (ohne Soll/Haben-Kz)': serializeNumber(newAmount),
            }
            changed.push([r, updated])
            return r
        }
        return r
    })
    const sortedChanged = sortBy(changed, (r) => r[0]['Belegfeld 1'])
    console.log('Relevant Customer', changed.length, sortedChanged.map(mapChanged))
    return mapped
}

function deleteCustomerUnnecessary(data: Row[]) {
    const deleted: Row[] = []
    const result: Row[] = []
    data.forEach((r) => {
        if (USD_CUSTOMERS.includes(r.Konto) && r['Gegenkonto (ohne BU-Schlüssel)'] === '8000') {
            deleted.push(r)
        } else {
            result.push(r)
        }
    })

    console.log('DeletedVendorCustomers', deleted.length, deleted.map(pickRelevant))
    return result
}

function exportFile(data: Row[]) {
    const asString = unparse(data, {
        // quotes: true,
        delimiter: ';',
    })
    const fileName = `EXTF_Buchungsstapel_20190101_bis_20200101-cleaned.csv`
    const targetPath = Path.join(__dirname, './data', fileName)
    fs.writeFileSync(targetPath, asString)
}

function pickRelevant(row: Row) {
    return `${row['Umsatz (ohne Soll/Haben-Kz)']} | ${row['Konto']} => ${row['Gegenkonto (ohne BU-Schlüssel)']} (${row['Belegfeld 1']})`
}

function mapChanged(ch: [Row, Row]) {
    const [pre, post] = ch
    return `${pre['Belegfeld 1']}: ${pre['Umsatz (ohne Soll/Haben-Kz)']} => ${post['Umsatz (ohne Soll/Haben-Kz)']}`
}
function parseNumber(r: string) {
    return parseFloat(r.replace(',', '.'))
}

function serializeNumber(r: number) {
    const rounded = Math.round(r * 100) / 100
    const formatted = formatter.format(rounded)
    const final = formatted.replace(',', '').replace('.', ',')
    return final
}
