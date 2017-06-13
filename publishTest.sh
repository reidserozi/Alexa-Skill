del indexTest.zip
7z a indexTest.zip @listfile
aws lambda update-function-code --function-name OneCaryTest --zip-file fileb://index.zip
