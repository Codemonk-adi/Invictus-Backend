const auth = require("../middleware/auth")()
    // const { Query } = require("mongoose");
const { spawn, exec } = require('child_process');
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
        console.log(templateID)
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

        await query.save()
            // let process = []
            // for (let i = 0; i < query.parsed.length; i++) {
            //     (function(i){
            //     console.log("started")
            //     process[i] = exec('python', ["./pythonCode/main.py",
            //         query.id,
            //         i,
            //         query.parsed[i].url,
            //         query.parsed[i].filetype,
            //         query.templateID
            //     ])

        //     process[i].stderr.on('data',err =>{

        //         console.log(err.toString());
        //     })

        //     process[i].on('close', (code) => {
        //         console.log("done")
        //     });
        // })(i)
        // process.on("close", async (code) =>{
        //     console.log("done with image")


        process = spawn('python', ["./pythonCode/main.py",
            query.id,
            0,
            query.parsed[0].url,
            query.parsed[0].filetype,
            query.templateID
        ], { env: { mongo_url: process.env.MONGO_URL } })

        process.stderr.on('data', err => {

            console.log(err.toString());
        })

        process.on('close', async(code) => {
            console.log("done")
            const postQueries = await Query.findById(query.id)
            res.json(postQueries.parsed[0].document)


        });
        // const user = await User.findById(userid);
        // // console.log(query.id)
        // const postQueries = await Query.findById(query.id)
        // // console.dir(postQueries.parsed[0])

        // user.queries.push(query.id);
        // await user.save()
        // res.json(postQueries.parsed[0].document)
        //     })



        const user = await User.findById(userid);
        // console.log(query.id)
        // const postQueries = await Query.findById(query.id)
        // console.dir(postQueries.parsed[0])

        user.queries.push(query.id);
        await user.save()
            // res.json(query.id)

    }
}
exports.allQueries = async(req, res) => {
    const userid = req.user.id;
    const user = await User.findById(userid).populate({ path: 'queries' });
    res.json(user.queries)
}

exports.refinedSearch = async(req, res) => {

    console.dir(req)
    res.send("ack")

    // const queryid = req.body.queryid
    // console.log(queryid)
    // const query = await Query.findById(queryid)
    // let output = []
    // let parsed = {}
    // for (doc in query.parsed) {
    //     if (doc.isparsed == false) {
    //         continue;
    //     }
    //     parsed = doc.document;
    //     output.push(parsed)

    // }

    // res.json(output)

}

exports.deleteQuery = async(req, res) => {
    const { queryid } = req.body;
    console.log(queryid)
    await User.findByIdAndUpdate(req.user.id, { $pull: { queries: queryid } })
    await Query.findByIdAndDelete(queryid);
    res.send('Deleted');
}