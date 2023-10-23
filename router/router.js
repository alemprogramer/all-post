const facebookRouter = require('./facebookRouter')
const linkedinRouter = require('./linkedinRouter')
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
        path: '/ok/thx',
        handler:(req,res)=>{
            let arr = ['ok', 'th'];
            let path = req.originalUrl.split('/')[2]
            if(req.params){
                path = path.split('?')[0]
            }
            res.send('arr.includes(path)')
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