# A Look Inside the Blackbox: BERT Visualization

An interactive article showing how BERT understands website texts from the event industry. This project follows a single sentence through all stages of model processing – from tokenization to final classification.

## 🎯 About the Project

This project demonstrates the inner mechanisms of a fine-tuned BERT model that automatically categorizes German event industry websites. Instead of viewing the "blackbox" as impenetrable, we lift the lid and show how meaning builds up step by step in the model.

### What you will learn:
- **Tokenization**: How text is broken down into tokens
- **Embeddings**: Vector representations in high-dimensional space
- **Attention Mechanisms**: How BERT understands context
- **Transformer Blocks**: Processing through 12 layers
- **Specialized Components**: How different roles emerge
- **Classification**: From CLS token to final decision

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/davidbirkenberger/mechinterp_article.git
cd mechinterp_article

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main page with interactive visualization
│   ├── layout.tsx            # Root Layout with Error Boundary
│   └── globals.css           # Global styles
├── components/
│   ├── RawTextCard.tsx       # Raw website text display
│   ├── TokenizedSentence.tsx # Tokenized representation
│   ├── TokenEmbeddingsPanel.tsx # 2D embedding visualization
│   ├── VocabNeighborsViz.tsx # Vocabulary neighbors t-SNE
│   ├── TransformerBlockWrapper.tsx # Transformer block interface
│   ├── AttentionMatrixViz.tsx # Attention matrix visualization
│   ├── FeedForwardViz.tsx    # Feed-Forward Network
│   ├── ClsToOutputViz.tsx    # CLS to output classification
│   ├── SpecializedHeadViz.tsx # Specialized attention heads
│   ├── ModelCard.tsx         # Model details and metrics
│   ├── LabeledContainer.tsx  # Wrapper for labeled sections
│   ├── LoadingSpinner.tsx    # Loading animation
│   ├── DataLoadingState.tsx  # Extended loading states
│   ├── ErrorBoundary.tsx     # Error handling
│   └── DataErrorBoundary.tsx # Data-specific error handling
├── hooks/
│   ├── useModelData.ts       # Model data hook
│   ├── useVocabNeighbors.ts  # Vocabulary neighbors hook
│   ├── useSentenceAttention.ts # Attention data hook
│   └── useAttentionVisualization.ts # Attention visualization hook
└── public/
    ├── model_data.json       # Main model data
    ├── neighbors_by_token.json # Vocabulary neighbors
    ├── sentence_attention.json # Attention data
    └── *.csv                 # Embedding data
```
