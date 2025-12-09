import os
import json
import asyncio
from typing import List, Dict
import aiohttp

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.provider = os.getenv("LLM_PROVIDER", "gemini")
        self.model = os.getenv("LLM_MODEL", "gemini-2.0-flash")

        # Define the base URL
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"
        
    async def generate_narration(self, valid_objects: List[Dict]) -> str:
        """
        Generates a natural language description of the scene based on detected objects.
        
        Args:
            valid_objects: List of dicts, e.g., [{"color": "Red", "position": "left"}]
            
        Returns:
            str: A natural language description.
        """
        if not valid_objects:
            return "The scene is empty."
            
        prompt = self._construct_prompt(valid_objects)
        
        if not self.api_key:
            # Fallback mock response if no API key is set
            print("Warning: GEMINI_API_KEY not set. Using mock response.")
            return self._mock_response(valid_objects)
            
        try:
            if self.provider == "gemini":
                return await self._call_gemini(prompt)
            # Add other providers here
            else:
                return self._mock_response(valid_objects)
        except Exception as e:
            print(f"LLM Error: {e}")
            return "I'm having trouble seeing right now."

    def _construct_prompt(self, objects: List[Dict]) -> str:
        description = ", ".join([f"a {obj['color']} object on the {obj['position']}" for obj in objects])
        return f"Briefly describe this scene to a user: {description}. Be creative but concise."

    def _mock_response(self, objects: List[Dict]) -> str:
        """Simple template-based response for testing without API keys"""
        colors = [obj['color'] for obj in objects]
        unique_colors = sorted(list(set(colors)))
        
        if len(unique_colors) == 1:
            return f"I see something {unique_colors[0]}!"
        elif len(unique_colors) == 2:
            return f"I see {unique_colors[0]} and {unique_colors[1]} objects."
        else:
            return f"Wow, there are {len(objects)} colorful objects here!"

    async def _call_gemini(self, prompt: str) -> str:
        """Basic Gemini API call"""
        url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"

        # The system intruction is separated from the main prompt in the the payload
        system_instruction = "You are a helpful narrator for a blind use. Describe the scene briefly, using simple and direct language."
        payload = {
            "contents":[{
                "parts": [{"text":prompt}]
                }],
            "systemInstruction":{
                "parts":[{"text":system_instruction}]
            },
            # Configuration for concise output
             "config":{
                "maxOutputTokens":51,
                "temperature":0.3
             }
        }

        # Headers
        headers = {
            "Content-Type":"application/json"
        }
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                if response.status == 200:
                    result = await resp.json()
                    # Navigate the JSON response structure
                    candidate = result.get('candidate', [{}])[0]
                    text_part = candidate.get('content', {}).get('parts', [{}])[0]
                    return text_part.get('text', 'Narration unavailable.')
                else:
                    error_text = await response.text()
                    print(f"Gemini API returned status{response.status}:{error_text}")
                    return f"Error: Failed to connect to Gemini API (Status {response.status})"
