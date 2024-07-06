from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import torch
from PIL import Image
import nltk
from nltk import pos_tag
from nltk.tokenize import word_tokenize

# Download NLTK resources
# nltk.download('punkt')
# nltk.download('averaged_perceptron_tagger')

model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

max_length = 16
num_beams = 4
gen_kwargs = {"max_length": max_length, "num_beams": num_beams}

def extract_nouns(text):
    tokens = word_tokenize(text)
    tagged = pos_tag(tokens)
    nouns = [word for word, pos in tagged if pos.startswith('NN')]
    return nouns

def hash_pred(image):
    images = [image]

    pixel_values = feature_extractor(
        images=images, return_tensors="pt"
    ).pixel_values
    pixel_values = pixel_values.to(device)
    output_ids = model.generate(pixel_values, **gen_kwargs)

    preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
    preds = [pred.strip() for pred in preds]
    print("Generated caption:", preds)

    hashtags = []
    for caption in preds:
        nouns = extract_nouns(caption)
        for noun in nouns:
            hashtags.append('#' + noun)

    print("Generated hashtags:", hashtags)
    res = {}
    res['preds'] = preds
    res['hashtags'] = hashtags
    return res


