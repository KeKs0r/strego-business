export const USD_VENDORS = [
    '70009',
    '70004',
    '70020',
    '70013',
    '70002',
    '70008',
    '70011',
    '70030',
    '70060',
]

export const USD_CUSTOMERS = ['10012', '10000', '10014']

export const USD_MERGED: Record<string, string> = {
    '70039': '70009',
    '70020': '70038',
    '70002': '70022',
}

export const TRANSFERWISE_KONTO = '1225'

// https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/Umsatzsteuer-Umrechnungskurse/2020-01-29-umsatzsteuer-umrechnungskurse-2019.pdf?__blob=publicationFile&v=5
// Took Juni because its in the middle
export const BACKUP_EXCHANGE_RATE = 1.1293
