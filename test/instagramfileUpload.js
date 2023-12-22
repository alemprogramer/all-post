const axios = require('axios');

const pageAccessToken = 'EABImtNdQ8q4BOZBKHtwkQwEfWZAQg0txRBRtX0VzRgrtR51iRSfPI7JjL0sSNZA9ZBMcozxwTvWIR1mZCEZBBATzPZASXYfTZAqrsYkfHF2nCnuKQSgZCLjnyWftmp8WxsZAQEvVkPpUMQyiCoCNmq9azY3HGDA4JVnjDpllZCPJzcuj8T61ZA6GX0lCsWSB6KOjQjoH6aVEqJd2taFUm5qNTWYFBgegBgjxtzoCGgZDZD';
const postId = '3329119080652276_3799595120271334';

async function getPostDetails() {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${postId}`,
      {
        params: {
          access_token: pageAccessToken,
          fields: 'id,message,created_time,from,full_picture', // Add more fields as needed
        },
      }
    );

    const postDetails = response.data;
    console.log('Post details:', postDetails);
    return postDetails;
  } catch (error) {
    console.error('Error getting post details:', error.message);
    throw error;
  }
}

// Example usage
getPostDetails()
  .then((postDetails) => {
    // Use postDetails as needed
    console.log('Post details from the function:', postDetails);
  })
  .catch((error) => {
    // Handle errors
    console.error('Error in example usage:', error.message);
  });





