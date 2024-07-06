import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

device = "cuda"

# "cuda" if torch.cuda.is_available() else

model_name = "gpt2-large"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name).to(device)

input_text=input()

def cap_pred(input_text):
    max_length = 128
    input_ids = tokenizer(input_text, return_tensors="pt")

    input_ids = input_ids['input_ids'].to(device)

    output = model.generate(input_ids, max_length=max_length, num_beams=5,
                        do_sample=False, no_repeat_ngram_size=2)
    captions=tokenizer.decode(output[0], skip_special_tokens=True)

    return captions

cap_pred(input_text)