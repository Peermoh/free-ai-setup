# Free AI Setup on Windows

A free-to-start AI chat setup for an ordinary Windows laptop, set up with PowerShell scripts.

**Open WebUI** (chat page) → **OmniRoute** (router) → free tiers of **Groq, Gemini, NVIDIA NIM, OpenRouter** → **Ollama** on your laptop as the private last resort. If one service is busy or out of free quota, the next one answers automatically.

📄 **Full guide:** [docs/Free-AI-Setup-Guide.pdf](docs/Free-AI-Setup-Guide.pdf)

## Quick start

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
cd scripts
Get-ChildItem *.ps1 | Unblock-File
.\setup-ai.ps1 -Install      # installs Ollama, Node.js, Python 3.11, OmniRoute, Open WebUI
# browser steps: create free API keys + two OmniRoute keys (guide, section 2)
.\setup-ai.ps1 -Configure    # adds providers, connects Open WebUI, builds and tests fallback combos
```

## What's inside

| Path | What it does |
| --- | --- |
| `scripts/setup-ai.ps1` | Install everything (`-Install`), then configure it (`-Configure`) |
| `scripts/add-provider.ps1` | Add a provider: shows its tier (FREE, FREE TRIAL, FREE + PAID, CREDITS, PAID or CHECK), its limits and how it uses your data, then lets you pick models |
| `scripts/ai-sync.ps1` | Applies your list of models and combos; switches optional features on or off |
| `scripts/omniroute-test.ps1` | Tests every model and simulates outages to prove fallback works |
| `scripts/start-ai.bat` | One-click daily start |
| `kaggle/kaggle-ollama-fixed-tunnel.ipynb` | Optional: a bigger model on Kaggle's free GPU, at a fixed address, protected by a token |

Your own list of models lives in `C:\Users\YOU\ai-config\ai-models.json` (with automatic backups), so updating the scripts never overwrites it.

## Highlights

- **Small messages:** optional features are off by default, so a plain "hello" costs about 72 input tokens instead of ~4,400.
- **Automatic fallback** across free providers, with your laptop model last.
- **Keys stay private:** provider keys are typed with hidden input and stored only inside OmniRoute.

## Please read

- **Free tiers have limits and change often.** Some free tiers may use your prompts to improve their products (see the guide's *Free services: limits and cautions*). Check each provider's current terms.
- **Keep private, client or work data on the local model only**, and only where your employer's policies allow it.
- Never commit API keys, tokens or tunnel addresses to this repository.
- Not affiliated with Open WebUI, OmniRoute, Ollama, Kaggle or any AI provider. Provided as-is, without warranty (see LICENSE).

## Requirements

Windows 10/11, PowerShell 5.1+, 16 GB RAM recommended, about 25 GB free disk space. No GPU needed.
