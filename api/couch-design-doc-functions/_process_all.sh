#!/bin/bash

# Directory containing the .js files
DIRECTORY="./"

# Loop through each .js file in the directory
for file in "$DIRECTORY"/*.js
do
    filename=$(basename -- "$file")

    # Check if file is "_flatten.js" and skip if it is
    if [ "$filename" == "_flatten.js" ]; then
        continue
    fi
    
    # Check if file is a regular file
    if [ -f "$file" ]; then
        # Extract the filename without extension
        filename="${filename%.*}"

    

        # Run your Node.js script and redirect output to a new file with .flat extension
        node _flatten.js "$file" > "$DIRECTORY/$filename.flat"
    fi
done
