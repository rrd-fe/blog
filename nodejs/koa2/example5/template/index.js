const nunjucks = require('nunjucks');

let env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(ROOT_PATH, {
            noCache: true,
            watch: true,
        }), {
            autoescape: true,
            throwOnUndefined: true
        });
module.exports = env;