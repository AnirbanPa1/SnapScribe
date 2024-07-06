from fastapi import FastAPI, File, UploadFile
from PIL import Image
import io
from pydantic import BaseModel

import requests
from model import hash_pred
# from model2 import cap_pred
import uvicorn

# Initialize FastAPI app
app = FastAPI()

class RequestPrediction(BaseModel):
    file: str

class RequestCaptions(BaseModel):
    text: str

# Example function to process image file and make predictions
def process_image(fileUrl):
    
    response = requests.get(fileUrl)

    image = Image.open(io.BytesIO(response.content))
    
    predictions = hash_pred(image)
    return predictions

# def process_text(desc):
#     captions = cap_pred(desc)
#     return captions

# Define endpoint to receive image file
@app.post("/predict/")
async def predict(req: RequestPrediction):
    predictions = process_image(req.file)
    print(predictions)
    return {"predictions": predictions}

# @app.post("/captions/")
# async def captions(req: RequestCaptions):
#     captions = process_text(req.text)
#     return {"captions" : captions}



uvicorn.run(app=app, port=8000)