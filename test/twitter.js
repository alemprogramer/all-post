const { TwitterApi }=require('twitter-api-v2');

// // Instantiate with desired auth type (here's Bearer v2 auth)
// // const twitterClient = new TwitterApi('Bearer AAAAAAAAAAAAAAAAAAAAABAZqgEAAAAAhuU0%2BfWNN2IdXJ6GkZBN39nDO5U%3DcZoOymvGW8oPayNFKtXC5SroIZ74T9JqMjnxBdejOVPakaKyqQ');


// const client = new TwitterApi({
//     appKey: 'zY3gWkhzuXN3bV4HfqBJdUDiw',
//     appSecret: 'Gmz3wtLc5RGpP8O97do7D6AGXSCw7SNmpkxwq7z1d4SmbONrF1',
//     accessToken: '1713443930044551168-K6cBOrEYLbGYsHnCDRKqSfEWgKSXXa',
//     accessSecret: 'clKOdFLYjfHrb2Wm68FsfF0NskkwQAy1fW1tEqhVnn2NK',
//   });
  
// //   const rwClient = client.readWrite;
// // Tell typescript it's a readonly app
// // const readOnlyClient = twitterClient.readWrite;


// const showData = async () =>{
//     console.log('here');
  
//     const tweet = await client.v2.tweet({
//         text: 'test tweet Mujahid',
        
//       });
//     console.log("🚀 ~ file: twitter.js:29 ~ showData ~ tweet:", tweet)
// }
// // showData()






  const refreshToken = async () =>{
    const client = new TwitterApi({ 
        clientId: 'cnRtUXlndWdES0RlQmxaWUQtaC06MTpjaQ',
        clientSecret: 'LhBS1CfzRfi-bed2XQt5VcBDH4b_NbpVZ31xg7Q8ZuXppXs3hX',
     });

// Obtain the {refreshToken} from your DB/store
    const { client: refreshedClient, accessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token('dWF2Sjk3anJ6QVNyMTNwMEpIMnNSODZtUzNtMEtwZmh4ckpUVXk1Z1JCdUEyOjE2OTc3MDI3MzE1NTE6MTowOnJ0OjE');
    console.log("🚀 ~ file: twitter.js:77 ~ refreshToken ~ accessToken:", accessToken)

// Store refreshed {accessToken} and {newRefreshToken} to replace the old ones

// Example request
   let data = await refreshedClient.v2.me();
   console.log("🚀 ~ file: twitter.js:83 ~ refreshToken ~ data:", data)

  }

//   refreshToken()


const client = new TwitterApi('RHlESmZ6eDZvWlVucTROZEwxeHhFVDlNWjEtYkxjSWxSdTgtb0hlbDRKZGdPOjE2OTc3MDMxNTY4MDQ6MTowOmF0OjE');

const tweets = async()=>{
   let data =  await client.v2.tweet('twitter-api-v212312 is awesome! from Hasib');
    console.log("🚀 ~ file: twitter.js:100 ~ tweets ~ data:", data)
    // const tweet = await client.v2.tweet('Hello, this is a test.');
}


tweets()


