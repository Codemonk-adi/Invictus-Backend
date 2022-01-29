const auth = require("../middleware/auth")()
    // const { Query } = require("mongoose");
const { spawn } = require('child_process');
const Query = require("../models/queries")
const User = require("../models/user")
const _ = require("lodash");
const bbPromise = require('bluebird');
const { resolve } = require("path/posix");

// require(")
// const { PythonShell } = require('python-shell');
// const imageToBase64 = require('image-to-base64');
// let fs = require("fs

exports.secureparser = async(req, res) => {
    const user = req.user;
    const templateID = req.body.templateid;
    const timestamp = new Date()
        // const options = req.body.options;
    const query = new Query({
        timestamp,
        templateID
        // options
    })
    query.parsed = req.files.map(f => ({ url: f.path, filetype: f.mimetype, document: {} }));
    if (!query.parsed[0]) {
        return res.json({ "msg": "No files Attached" })
    }

    // console.dir(query.parsed[0])
    let finalout = []
        // const promises = []

    function create_process(file) {
        return new bbPromise((resolve, reject) => {
            var c_process = spawn('python', ["./pythonCode/main.py",
                file.url,
                file.filetype,
                query.templateID
            ])

            c_process.stdout.on('data', data => {
                // console.log(data.toString())
                out = JSON.parse(data.toString())
                finalout.push(out)
            })

            c_process.stderr.on('data', function(err) {
                reject(err.toString());
            });
            // promises.push(c_process)
            c_process.on('close', () => {
                resolve()
            });
        })
    }


    bbPromise.map(req.files, (file) => {
        return create_process(file)
    }).then(() => {
        for (let i = 0; i < req.files.length; i++)
            query.parsed[i].document = finalout[i];

        res.json(query.parsed)
        user.queries.push(query.id);
        user.save()
        query.save()
    })

    // for (let file in req.files) {

    //     let c_process = spawn('python', ["./pythonCode/main.py",
    //         file.url,
    //         file.filetype,
    //         query.templateID
    //     ])

    //     c_process.stdout.on('data', data => {
    //         // console.log(data.toString())
    //         out = JSON.parse(data.toString())
    //         finalout.push(out)
    //     })
    //     promises.push(c_process)
    //         // c_process.on('close', async() => {
    //         //     // console.log("done")
    //         //     // outQuery = await Query.findById(query.id)
    //         //     // const postQueries = await Query.findById(query.id)
    //         //     // res.json(postQueries.parsed[0].document)
    //         // });
    // }
    // Promise.all(promises).then(() => {



}
exports.allQueries = async(req, res) => {
    const userid = req.user.id;
    const user = await User.findById(userid).populate({ path: 'queries' });
    res.json(user.queries)
}


exports.nosaveparser = async(req, res) => {
    const templateID = req.body.templateid;
    // console.dir(query.parsed[0])
    // console.dir(req.files)
    const c_process = spawn('python', ["./pythonCode/main.py",
        req.files[0].path,
        req.files[0].mimetype,
        templateID
    ])
    c_process.stderr.on('data', e => {
        console.log(e.toString());
    })

    c_process.stdout.on('data', data => {
        // console.log(data.toString())
        finalout = JSON.parse(data.toString())
        res.json(finalout)

    })
}
exports.refinedSearch = async(req, res) => {
    const {
        options,
        queryid,
    } = req.body
    const query = await Query.findById(queryid)
    let output = []
    let parsed = {}
    for (doc in query.parsed) {
        if (doc.isparsed == false) {
            continue;
        }
        parsed = doc.document;
        for (opt in options) {
            _.get(parsed, opt)
        }

    }


}

exports.deleteQuery = async(req, res) => {
    const { queryid } = req.body;
    console.log(queryid)
    await User.findByIdAndUpdate(req.user.id, { $pull: { queries: queryid } })
    await Query.findByIdAndDelete(queryid);
    res.send('Deleted');
}