module.exports = {
    apps: [{
        name: "velocirapid",
        script: "./index.js",
        watch: false,
        instances: "max",
        exec_mode: "cluster"
    }, {
        name: "deploy-watcher",
        script: "./deploy.js",
        watch: false
    }]
}