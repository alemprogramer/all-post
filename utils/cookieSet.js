exports.setToken = async (refresh_token,access_token,res)=>{
    res.cookie('refresh_token', refresh_token, 
    {
        httpOnly: false,
        path: '/',
        maxAge: 30*24*60*60*1000 // 30 days
    })

    res.cookie('access_token', access_token, 
    {
        httpOnly: false,
        path: '/*',
        maxAge: 30*24*60*60*1000 // 30 days
    })
}

exports.cookieSet = (name,value,res) =>{
    res.cookie(name, value, 
    {
        httpOnly: false,
        path: '/*',
        maxAge: 30*24*60*60*1000 // 30 days
    })
}