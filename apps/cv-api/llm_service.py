import os
import json
import asyncio
from typing import List, Dict
import aiohttp

class LLMService:
    def __init__(self):
        self.api_key = os.getenv("LLM_API_KEY")
        self.provider = os.getenv("LLM_PROVIDER", "openai")
        self.model = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
        
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
            return self._mock_response(valid_objects)
            
        try:
            if self.provider == "openai":
                return await self._call_openai(prompt)
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

    async def _call_openai(self, prompt: str) -> str:
        """Basic OpenAI API call"""
        async with aiohttp.ClientSession() as session:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            data = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful narrator for a blind user. Describe the scene briefly."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 50
            }
            async with session.post("https://api.openai.com/v1/chat/completions", headers=headers, json=data) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    return result['choices'][0]['message']['content']
                else:
                    return f"Error: {resp.status}"
