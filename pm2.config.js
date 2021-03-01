module.exports = {
    apps: [{
        name: "velocirapid",
        script: "./index.js",
        watch: false
    }, {
        name: "deploy-watcher",
        script: "./deploy.js",
        watch: false
    }]
}