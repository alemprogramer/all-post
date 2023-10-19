


exports.twitterTweetPostController = async (req,res,next) => {

    const config = {
        consumer_key: 'RqmeYeipJjDqwZ1nia0NB9oel',
        consumer_secret: 'aEG4aqpBVsZiscmjluLPrEBGRplvjBNk4xoTsf5NWFRDxPTUlK',
        access_token: "1713443930044551168-YMXwIMo3rW3mT1bCTmXDYEbJhCremf",
        access_token_secret: "XwcCQReNAMVVenbYIpb5Mor0h2c0pN6XO9nkQILNH5VYV"
    };

    var client = new Twitter({
        consumer_key: 'RqmeYeipJjDqwZ1nia0NB9oel',
        consumer_secret: 'aEG4aqpBVsZiscmjluLPrEBGRplvjBNk4xoTsf5NWFRDxPTUlK',
        access_token_key: '1713443930044551168-He1YlBVU1oxotdXxXbQ6Ql429d9sXS',
        access_token_secret: '33GKuR7tKxuf9H337zmvxrDEvqNrWTCa9JuNUeStsy6kI'
      });
       
      var params = {screen_name: 'nodejs'};
      client.get('statuses/user_timeline', params, function(error, tweets, response) {
        // console.log("🚀 ~ file: twitterController.js:23 ~ client.get ~ response:", response)
        if (!error) {
            console.log(error);
        }
        console.log(tweets);
        res.send('ok')
      });
};



