const azureConfig = {
  aiVision: {
    endpoint: 'https://harsha-project.cognitiveservices.azure.com/',
    apiKey: 'EMREj0THFqpXKnxuxAumExCF4ybGa389NDLAZMS0yXX0UsKDor4RJQQJ99BIACYeBjFXJ3w3AAAFACOG6kGW'
  }
};

async function testAzureVision() {
  const pdfUrl = 'https://harshastoragetejith.blob.core.windows.net/research-sources/1758275507293-04._Specialized_Process_Models_Session_4__1___1_.pdf';
  
  const url = `${azureConfig.aiVision.endpoint}/vision/v3.2/read/analyze`;
  
  console.log('Testing Azure AI Vision with PDF...');
  console.log('URL:', url);
  console.log('PDF URL:', pdfUrl);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': azureConfig.aiVision.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: pdfUrl,
      }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    } else {
      console.log('Success! Operation Location:', response.headers.get('Operation-Location'));
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testAzureVision();