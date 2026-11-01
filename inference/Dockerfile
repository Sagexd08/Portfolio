# SmolLM2-360M-Instruct served by llama.cpp on Cloud Run (OpenAI-compatible, streaming).
# Deploy: see inference/README.md
FROM ghcr.io/ggml-org/llama.cpp:server
USER root
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN curl -fL -o /model.gguf https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q8_0.gguf
EXPOSE 8080
ENTRYPOINT ["/app/llama-server","-m","/model.gguf","--host","0.0.0.0","--port","8080","-c","4096","-np","2","-t","2","--no-webui"]
