Fine-tuning teaches the model HOW to answer, RAG gives it WHAT to answer about.

# Model Fine-Tuning Guide

This repository contains everything you need to fine-tune the Gemma 2B model (or any other language model) on your custom data.

## What is Fine-Tuning?

Fine-tuning is the process of taking a pre-trained language model and adapting it to perform better on specific tasks or domains by training it on additional data. This allows the model to:

- Learn domain-specific knowledge
- Improve performance on specific tasks
- Adapt to particular writing styles or formats
- Handle specialized vocabulary and concepts

## What Data Do You Need?

### Data Format
Your training data should be in **JSONL format** with the following structure:
```json
{"instruction": "Your question or prompt here", "response": "The desired answer or completion here"}
{"instruction": "Another question", "response": "Another answer"}
```

### Data Requirements
- **Quality**: High-quality, accurate, and relevant data
- **Quantity**: Typically 100-1000+ examples for good results
- **Diversity**: Varied examples covering different aspects of your domain
- **Consistency**: Similar format and style across all examples

### Example Data Types
- **Q&A pairs**: Questions and their answers
- **Instruction-following**: Commands and expected outputs
- **Conversation**: Dialogue exchanges
- **Document completion**: Partial text and its completion

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare Your Data
```bash
python data_preparation.py
```
This will create a template file. Replace the example data with your actual training data.

### 3. Run Fine-Tuning
```bash
python fine_tune.py
```

## Detailed Usage

### Data Preparation Script (`data_preparation.py`)

This script helps you convert various data formats to the required JSONL format:

```python
from data_preparation import DataPreparator

preparator = DataPreparator()

# Convert CSV to JSONL
preparator.convert_to_jsonl("your_data.csv", "training_data.jsonl", "csv")

# Convert JSON to JSONL
preparator.convert_to_jsonl("your_data.json", "training_data.jsonl", "json")

# Validate your data
preparator.validate_jsonl("training_data.jsonl")
```

### Fine-Tuning Script (`fine_tune.py`)

The main fine-tuning script uses:
- **LoRA (Low-Rank Adaptation)**: Efficient fine-tuning that only updates a small number of parameters
- **4-bit quantization**: Reduces memory usage significantly
- **Gradient accumulation**: Allows larger effective batch sizes

#### Key Parameters to Adjust:

```python
# In the train() method:
fine_tuner.train(
    training_data,
    num_epochs=3,        # Number of training epochs
    batch_size=2,        # Batch size per device
    learning_rate=2e-4   # Learning rate
)

# In setup_lora_config():
lora_config = LoraConfig(
    r=16,                # Rank (higher = more parameters, more memory)
    lora_alpha=32,       # Alpha scaling
    lora_dropout=0.1     # Dropout probability
)
```

## Advanced Configuration

### Model Selection
You can fine-tune different models by changing the `model_name`:

```python
fine_tuner = ModelFineTuner(model_name="microsoft/DialoGPT-medium")
```

### Custom Training Arguments
Modify the `TrainingArguments` in the `train()` method:

```python
training_args = TrainingArguments(
    output_dir="./custom_output",
    num_train_epochs=5,
    per_device_train_batch_size=8,
    learning_rate=1e-4,
    warmup_steps=200,
    # ... other arguments
)
```

### Memory Optimization
If you're running into memory issues:

1. **Reduce batch size**: Set `batch_size=1`
2. **Reduce LoRA rank**: Set `r=8` or `r=4`
3. **Use gradient checkpointing**: Add `gradient_checkpointing=True` to TrainingArguments

## Monitoring Training

The script integrates with **Weights & Biases** for experiment tracking:

```bash
# Login to wandb (first time only)
wandb login

# Run fine-tuning
python fine_tune.py
```

You can monitor:
- Training loss
- Learning rate
- Memory usage
- Model performance

## Using Your Fine-Tuned Model

After training, your model will be saved in the `fine_tuned_model` directory. You can load and use it:

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

# Load base model and tokenizer
base_model = AutoModelForCausalLM.from_pretrained("google/gemma-2b")
tokenizer = AutoTokenizer.from_pretrained("google/gemma-2b")

# Load fine-tuned weights
model = PeftModel.from_pretrained(base_model, "fine_tuned_model")

# Generate responses
inputs = tokenizer("### Instruction:\nYour question here\n\n### Response:\n", return_tensors="pt")
outputs = model.generate(**inputs, max_length=200)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

## Troubleshooting

### Common Issues:

1. **Out of Memory (OOM)**:
   - Reduce batch size
   - Reduce LoRA rank
   - Use gradient checkpointing

2. **Poor Results**:
   - Check data quality
   - Increase training data
   - Adjust learning rate
   - Train for more epochs

3. **Training Not Converging**:
   - Lower learning rate
   - Increase warmup steps
   - Check data format

### Performance Tips:

- **Data Quality**: Better data beats more data
- **Hyperparameters**: Start with defaults, then tune
- **Monitoring**: Use wandb to track progress
- **Validation**: Save checkpoints and evaluate regularly

## Next Steps

1. **Collect your domain-specific data**
2. **Format it using the data preparation script**
3. **Run fine-tuning with appropriate parameters**
4. **Evaluate and iterate on your results**
5. **Deploy your fine-tuned model**

## Resources

- [Ollama models](https://ollama.com/library)
- [Hugging Face Transformers Documentation](https://huggingface.co/docs/transformers/)
- [PEFT Documentation](https://github.com/huggingface/peft)
- [LoRA Paper](https://arxiv.org/abs/2106.09685)
- [Weights & Biases](https://wandb.ai/)

## Support

If you encounter issues:
1. Check the troubleshooting section
2. Review your data format
3. Adjust hyperparameters
4. Check memory usage and system requirements
