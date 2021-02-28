module.exports = {
    apps: [{
        name: "velocirapid",
        script: "./index.js",
        watch: false,
        env: {
            "NODE_ENV": "DEV",
        },
        env_production: {
            "NODE_ENV": "PROD"
        }
    }, {
        name: "deploy-watcher",
        script: "./deploy.js"
    }]
}