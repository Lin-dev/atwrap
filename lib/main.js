import Airtable from 'airtable'
import _ from 'lodash'

const ENDPOINT_URL = 'https://api.airtable.com'
let API_KEY // Can only set the API key once per program

export default class AirTable {
    constructor({apiKey, databaseRef}) {
        if(!API_KEY) {
            API_KEY = apiKey
            Airtable.configure({
                endpointUrl: ENDPOINT_URL,
                apiKey: globalApiKey
            });
        }
        this.base = Airtable.base(databaseRef)
    }

    async getSingleRecordFrom({tableName, id}) {
        console.log(tableName, id)
        return new Promise((resolve, reject) => {
            this.base(tableName).find(id, function(err, record) {
            if (err) {
                console.error(err)
                reject(err)
            }
            resolve(record)
            })
                // console.log(record);
        })
    }

    async getAllRecordsFrom(tableName) {
        return this.getRecordsSelect({tableName, select: {} })
    }

    async getAllMatchedRecordsFrom({tableName, column, value}) {
        return this.getRecordsSelect({tableName, select: {filterByFormula:`${column} = ${value}`} }) // TODO: validate input
    }

    async getRecordsSelect({tableName, select}) {
        return new Promise((resolve, reject) => {
            let out = []
            this.base(tableName).select(select).eachPage((records, fetchNextPage) => {
                // Flatten single entry arrays, need to remove this hacky shit.
                _.map(records, r => {
                    _.forOwn(r.fields, (value, key) => { // If array is single
                        if(_.isArray(value) && value.length == 1 && key != 'rooms') {
                            r.fields[key] = value[0]
                        }
                    });
                })
                out = _.concat(out, records)
                fetchNextPage();
            }, (err) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    // console.log(JSON.stringify(out, null, 4))
                    // console.log("HI")
                    resolve(out)
                }
            })
        })
    }
}