const auth = require("../middleware/auth")()
    // const { Query } = require("mongoose");
const { spawn } = require('child_process');
const Query = require("../models/queries")
const User = require("../models/user")
const _ = require("lodash");
// const { PythonShell } = require('python-shell');
// const imageToBase64 = require('image-to-base64');
// let fs = require("fs");

exports.secureparser = async(req, res) => {
    {
        const userid = req.user.id;
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

        for (let i = 0; i < query.parsed.length; i++) {
            var process = spawn('python', ["./hello.py",
                query.id,
                i,
                query.parsed[i].url,
                query.parsed[i].filetype,
                query.templateID
            ]);
        }


        const user = await User.findById(userid);
        // console.dir(user.queries)

        user.queries.push(query.id);
        await query.save()
        await user.save()
        res.send(req.files)

    }
}
exports.allQueries = async(req, res) => {
    const userid = req.user.id;
    const user = await User.findById(userid).populate({ path: 'queries' });
    res.json(user.queries)
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