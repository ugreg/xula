import platform
import psutil

def test_cuda():
    """Test CUDA availability"""
    try:
        import torch
        if torch.cuda.is_available():
            print(f"✓ CUDA available: {torch.cuda.get_device_name(0)}")
            print(f"✓ CUDA version: {torch.version.cuda}")
            return True
        else:
            print("⚠ CUDA not available - training will use CPU (much slower)")
            return False
    except Exception as e:
        print(f"❌ CUDA test failed: {e}")
        return False

def test_memory():
    """Test available memory"""
    try:
        import torch
        if torch.cuda.is_available():
            memory = torch.cuda.get_device_properties(0).total_memory / 1e9
            print(f"✓ GPU Memory: {memory:.1f} GB")
            
            if memory < 8:
                print("⚠ Warning: Less than 8GB GPU memory. You may need to:")
                print("   - Reduce batch size")
                print("   - Use smaller LoRA rank")
                print("   - Enable gradient checkpointing")
        else:
            print("CPU training mode")
            print(f"System: {platform.system()} {platform.release()}")
            print(f"Processor: {platform.processor()}")
            print(f"CPU cores: {psutil.cpu_count(logical=False)} physical, {psutil.cpu_count(logical=True)} logical")
            mem = psutil.virtual_memory()
            print(f"RAM: {mem.total / 1e9:.1f} GB")
            
    except Exception as e:
        print(f"❌ Memory test failed: {e}")
