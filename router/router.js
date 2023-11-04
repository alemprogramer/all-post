const facebookRouter = require('./facebookRouter');
const linkedinRouter = require('./linkedinRouter');
const twitterRouter = require('./twitterRouter');
const authRouter = require('./authRouter');
const postRouter = require('./allPostRouter')

const routers = [
    {
      path: '/post',
      handler: postRouter  
    },
    {
        path: '/facebook',
        handler:facebookRouter
    },
    {
        path: '/linkedin',
        handler:linkedinRouter
    },
    {
        path: '/twitter',
        handler:twitterRouter
    },
    {
        path: '/auth',
        handler:authRouter
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
            app.get('/api/v1' +router.path, router.handler);
        }
        else{
        app.use('/api/v1' +router.path, router.handler);
        }
    });
}