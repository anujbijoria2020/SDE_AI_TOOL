# Generation endpoints

from fastapi import APIRouter, HTTPException
from models.schemas import ProjectInput
from services.prompt_builder import build_main_prompt
from services.gemini import call_gemini
from services.parser import parse_response

router = APIRouter()

@router.post("/generate")
async def generate_artifacts(project: ProjectInput):
    try:
        # Step 1: Build prompt
        prompt = build_main_prompt(project.description)
        
        # Step 2: Call Gemini
        raw_response = call_gemini(prompt)
        
        # Step 3: Parse response
        artifacts = parse_response(raw_response)
        
        return {
            "success": True,
            "data": artifacts
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )