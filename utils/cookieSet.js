module.exports = async (refresh_token,access_token,res)=>{
    res.cookie('refresh_token', refresh_token, 
    {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 30*24*60*60*1000 // 30 days
    })

    res.cookie('access_token', access_token, 
    {
        httpOnly: true,
        path: '/user/refresh_token',
        maxAge: 30*24*60*60*1000 // 30 days
    })
}