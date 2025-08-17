import os
import requests
import base64

# Load environment variables


# API configuration
CLIPDROP_API_KEY = 'fc4f4e233593d8d5af1cf1b8f80416ad3eadf2006a86348bf4c5e9119049d9134abfc8e47842845bd7708642040eee32'
CLIPDROP_API_URL = "https://clipdrop-api.co/text-to-image/v1"

def generate_and_save_image(prompt, output_path="generated_image.png"):
    """
    Generate an image from text using ClipDrop API and save it locally
    
    Args:
        prompt (str): The text prompt to generate the image
        output_path (str): Path to save the generated image
    """
    try:
        # Prepare the request
        files = {
            'prompt': (None, prompt)
        }
        headers = {
            'x-api-key': CLIPDROP_API_KEY
        }

        # Make the API request
        response = requests.post(CLIPDROP_API_URL, files=files, headers=headers)
        response.raise_for_status()  # Raise exception for HTTP errors

        # Save the image to file
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        print(f"Image successfully saved to {output_path}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"Error making API request: {e}")
        if hasattr(e, 'response') and e.response:
            print(f"API response: {e.response.text}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    # Example usage
    prompt = "Create a holi sale poster for Mrs Sells Ahmedabad it should have offer 90 off use some abstract colors and mention address contact number "
    output_filename = "my_generated_image2.png"
    
    print(f"Generating image for prompt: '{prompt}'")
    success = generate_and_save_image(prompt, output_filename)
    
    if success:
        print("Image generation successful!")
    else:
        print("Image generation failed")