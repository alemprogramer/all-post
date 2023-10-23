const facebookRouter = require('./facebookRouter');
const linkedinRouter = require('./linkedinRouter');
const twitterRouter = require('./twitterRouter');

const routers = [
    {
        path: '/api/v1/facebook',
        handler:facebookRouter
    },
    {
        path: '/api/v1/linkedin',
        handler:linkedinRouter
    },
    {
        path: '/api/v1/twitter',
        handler:twitterRouter
    },
    {
        path: '/',
        handler:(req,res)=>{
            res.send('<center><h1>Welcome to Post All API v1</h1></center>')
        }
    },
];


module.exports = (app)=>{
    routers.forEach(router => {
        if(router.path === '/'){
            app.get(router.path, router.handler);
        }
        else{
        app.use(router.path, router.handler);
        }
    });
}