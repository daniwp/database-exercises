import MongoClient from 'mongodb';
const url = "mongodb://localhost:27017";
let con;

function getDB() {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, (err, mongo) => {
            con = mongo;
            if (err) reject(err);
            const tweets = mongo.db("social_net").collection('tweets');
            resolve(tweets);
        });
    });
}

function closeDB() {
    try {
        con.close();
    } catch (err) {
        throw err;
    }
}

function getCount() {
    return new Promise((resolve, reject) => {
        getDB().then(db => {
            db.distinct("user", (err, result) => {
                if (err)  reject(err);
                resolve(result.length);
                closeDB();
            });
        });
    })
}


function getTop5MostGrumpy() {
    const query = [
        {"$match": {"polarity": {"$eq": 0},}},
        {"$group": {"_id": "$user", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ];

    return _getAggregatedResultsByQuery(query);
}

function getTop5MostHappy() {
    const query = [
        {"$match": {"polarity": {"$eq": 4},}},
        {"$group": {"_id": "$user", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ];

    return _getAggregatedResultsByQuery(query);
}

function getTop10MostActive() {
    const query = [
        {"$group": {"_id": "$user", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ];

    return _getAggregatedResultsByQuery(query);
}

function getTop10MostMentioned() {
    const regexMen = new RegExp('(?=^|(?=[^a-zA-Z0-9-_\\.]))@([A-Za-z]+[A-Za-z0-9_]+)');
    const query = [
        {"$match": {"text": {"$regex": regexMen}}},
        {"$project": {"user": "$user", "texts": {"$split": ["$text", " "]}}},
        {"$unwind": "$texts"},
        {"$match": {"texts": {"$regex": regexMen}}},
        {"$group": {"_id": "$texts", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ];

    return _getAggregatedResultsByQuery(query);
}

function getTop10MostLinking() {
    const regexLink = new RegExp('(?=^|(?=[^a-zA-Z0-9-_\\.]))@([A-Za-z]+[A-Za-z0-9_]+)');
    const query = [
        {"$match": {"text": {"$regex": regexLink}}},
        {"$group": {"_id": "$user", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ];

    return _getAggregatedResultsByQuery(query);
}

function _getAggregatedResultsByQuery(query) {
    return new Promise((resolve, reject)=> {
        getDB().then(db=> {
            db.aggregate(query).toArray((err, result) => {
                closeDB();
                if (err) reject(err);
                const res = result.map((item, i) => {
                    return {rank: i + 1, name: item._id, count: item.count};
                });
                return resolve(res);
            })
        });
    });
}

export default {
    getCount,
    getTop5MostGrumpy,
    getTop5MostHappy,
    getTop10MostActive,
    getTop10MostMentioned,
    getTop10MostLinking,
}
