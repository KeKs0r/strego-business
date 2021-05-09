import * as got from 'got'

const client = got.extend({
    json: true,
    baseUrl: 'https://api.debitoor.com/',
    headers: {
        'x-token':
            'eyJ1c2VyIjoiNWM1ODIxOWYxZDc2ZGIwMDIwZGU4MWRmIiwiYXBwIjoiNTdiMmZlMDkxZTkwMjQwZjAwNDZhNWEyIiwiY2hhbGxlbmdlIjowLCIkZSI6MCwiJHQiOjE2MDk5MzE0OTg5OTh9ClXChcOAJTh3N3F-w4oMfsO7N8Krw4Y',
    },
})

const data = {
    date: '2021-01-07',
    attachments: [{ fileId: '5ffae97a89549d0051efa3c3' }],
    lines: [
        {
            grossAmount: 0,
            taxRate: 0,
        },
    ],
}

run()
async function run() {
    try {
        const res = await client.post('/api/expenses/v5?autonumber=true', {
            body: data,
            json: true,
        })
        debugger
    } catch (e) {
        const errResp = e.body
        debugger
    }
}
