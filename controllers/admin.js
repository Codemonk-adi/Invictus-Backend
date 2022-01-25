const auth = require("../middleware/auth")()
    // const { Query } = require("mongoose");
const Query = require("../models/queries")
const User = require("../models/user")
exports.secureparser = async(req, res) => {
    {
        const userid = req.user.id;
        const timestamp = new Date()
        const options = req.body.options;
        const query = new Query({
            timestamp,
            options
        })
        query.parsed = req.files.map(f => ({ url: f.path, filename: f.filename }));
        if (!query.parsed[0]) {
            return res.json({ "msg": "No files Attached" })
        }
        const user = await User.findById(userid);
        console.dir(user.queries)
        user.queries.push(query.id);
        await user.save()
        await query.save()
        res.send(req.files)

    }
}
exports.allQueries = async(req, res) => {
    const userid = req.user.id;
    const user = await User.findById(userid).populate({ path: 'queries' });
    res.json(user.queries)
}

exports.deleteQuery = async(req, res) => {
    const { queryid } = req.body;
    console.log(queryid)
    await User.findByIdAndUpdate(req.user.id, { $pull: { queries: queryid } })
    await Query.findByIdAndDelete(queryid);
    res.send('Deleted');
}