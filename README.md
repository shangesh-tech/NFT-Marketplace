# NFT Marketplace - Avengers & Transformers

A complete NFT marketplace built with Next.js, Ethereum smart contracts, and IPFS for decentralized storage. This platform allows users to mint, buy, sell, and trade Avengers and Transformers NFT collectibles.

## 🚀 Project Overview

This project consists of:
- **Smart Contracts**: Ethereum-based NFT marketplace contract
- **Frontend**: Next.js application with modern UI/UX
- **IPFS Integration**: Decentralized storage for NFT metadata and images
- **Wallet Integration**: Support for MetaMask, Brave Wallet, and WalletConnect

## 📁 Project Structure

```
├── hardhat/                 # Smart contract development
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   └── test/                # Contract tests
├── client/                  # Next.js frontend application
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── store/               # State management
│   └── utils/               # Utility functions
```

## 🔗 Smart Contract APIs

### NFTMarketplace Contract

**Contract Address**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

#### Constants

```solidity
uint256 public constant MAX_PRICE = 1000 ether;
uint256 public constant MAX_SUPPLY = 10000;
uint256 public constant MAX_MINTS_PER_ADDRESS = 20;
```

#### Core Functions

##### `createToken(string memory tokenURI, uint256 price)`
**Description**: Mints a new NFT and lists it on the marketplace
**Parameters**:
- `tokenURI`: IPFS URI containing NFT metadata
- `price`: Listing price in wei (minimum 0.001 ether)
**Returns**: `uint256` - Token ID
**Payment**: Requires listing fee (0.0001 ether)

##### `createMarketSale(uint256 tokenId)`
**Description**: Purchase an NFT from the marketplace
**Parameters**:
- `tokenId`: ID of the token to purchase
**Payment**: Must send exact token price

##### `resellToken(uint256 tokenId, uint256 price)`
**Description**: Relist an owned NFT for sale
**Parameters**:
- `tokenId`: ID of the token to resell
- `price`: New listing price in wei
**Payment**: Requires listing fee (0.0001 ether)

#### View Functions

##### `fetchMarketItems()`
**Description**: Get all unsold NFTs in the marketplace
**Returns**: `MarketItem[]` - Array of available NFTs

##### `fetchMyNFTs()`
**Description**: Get all NFTs owned by the caller
**Returns**: `MarketItem[]` - Array of owned NFTs

##### `fetchItemsListed()`
**Description**: Get all NFTs listed for sale by the caller
**Returns**: `MarketItem[]` - Array of listed NFTs

##### `getMarketItem(uint256 tokenId)`
**Description**: Get details of a specific NFT
**Parameters**:
- `tokenId`: ID of the token
**Returns**: `MarketItem` - Token details

##### `getListingPrice()`
**Description**: Get the current listing fee
**Returns**: `uint256` - Current listing price

##### `getTotalTokens()`
**Description**: Get total number of tokens minted
**Returns**: `uint256` - Total token count

##### `getTotalSold()`
**Description**: Get total number of tokens sold
**Returns**: `uint256` - Total sold count

##### `isTokenListed(uint256 tokenId)`
**Description**: Check if a token is currently listed for sale
**Parameters**:
- `tokenId`: ID of the token
**Returns**: `bool` - Whether token is listed

##### `getMintCountByAddress(address minter)`
**Description**: Get number of NFTs minted by an address
**Parameters**:
- `minter`: Address to check
**Returns**: `uint256` - Number of NFTs minted

##### `remainingSupply()`
**Description**: Get remaining NFTs that can be minted
**Returns**: `uint256` - Remaining supply

#### Owner Functions

##### `updateListingPrice(uint256 _listingPrice)`
**Description**: Update the marketplace listing fee
**Parameters**:
- `_listingPrice`: New listing price
**Access**: Owner only

##### `pause()`
**Description**: Pause the marketplace in emergency
**Access**: Owner only

##### `unpause()`
**Description**: Unpause the marketplace
**Access**: Owner only

#### Events

```solidity
event MarketItemCreated(uint256 indexed tokenId, address indexed seller, address indexed owner, uint256 price, bool sold);
event MarketItemSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
event TokenListed(uint256 indexed tokenId, uint256 price);
event TokenMinted(uint256 indexed tokenId, string tokenURI);
event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice);
event MarketplacePaused(address admin);
event MarketplaceUnpaused(address admin);
```

## 🧩 Frontend Components

### Core Components

#### `Navbar`
**File**: `client/components/Navbar.jsx`
**Description**: Main navigation component with wallet integration
**Features**:
- Responsive navigation menu
- Active route highlighting
- Wallet connection integration
- Mobile-friendly design

**Props**: None (uses internal state and routing)

#### `WalletButton`
**File**: `client/components/WalletButton.jsx`
**Description**: Wallet connection and management component
**Features**:
- Multi-wallet support (MetaMask, Brave, WalletConnect)
- Connection status display
- Wallet disconnection
- Address shortening

**Props**: None (uses global state)

#### `Footer`
**File**: `client/components/Footer.jsx`
**Description**: Site footer component
**Features**:
- Basic footer information
- Links and credits

### Home Page Components

#### `Features`
**File**: `client/components/home/Features.jsx`
**Description**: Featured NFTs showcase component
**Features**:
- Featured NFT grid display
- NFT card with image, name, and likes
- Navigation to individual NFT pages
- Call-to-action to marketplace

**Props**: None (uses hardcoded featured NFTs)

#### `NFTCard` (Internal Component)
**Description**: Individual NFT display card
**Props**:
- `name`: NFT name
- `image`: NFT image URL
- `likes`: Number of likes/popularity

### Modal Components

#### `WalletConnectionModal`
**File**: `client/components/WalletButton.jsx`
**Description**: Modal for wallet selection and connection
**Props**:
- `isOpen`: Boolean to control modal visibility
- `onClose`: Function to close modal

**Features**:
- Wallet type selection
- Connection handling
- Error management
- Click-outside-to-close

## 🛠 API Routes

### File Upload API

#### `POST /api/files`
**File**: `client/app/api/files/route.js`
**Description**: Upload image files to IPFS
**Content-Type**: `multipart/form-data`
**Body**:
```javascript
FormData {
  file: File // Image file to upload
}
```
**Response**:
```javascript
{
  success: boolean,
  ipfsHash: string,
  url: string
}
```

### Metadata Upload API

#### `POST /api/metadata`
**File**: `client/app/api/metadata/route.js`
**Description**: Upload JSON metadata to IPFS
**Content-Type**: `application/json`
**Body**:
```javascript
{
  name: string,
  description: string,
  image: string,
  attributes: Array<{trait_type: string, value: string}>
}
```
**Response**:
```javascript
{
  success: boolean,
  ipfsHash: string,
  url: string
}
```

## 🔧 Utility Functions

### IPFS Utilities

#### `uploadImageToIPFS(file)`
**File**: `client/utils/ipfs.js`
**Description**: Upload image file to IPFS
**Parameters**:
- `file`: File object to upload
**Returns**: `Promise<{success: boolean, ipfsHash?: string, url?: string, error?: string}>`
**Validation**:
- File type must be image
- File size limit: 50MB

#### `uploadMetadataToIPFS(metadata)`
**File**: `client/utils/ipfs.js`
**Description**: Upload metadata JSON to IPFS
**Parameters**:
- `metadata`: Object containing NFT metadata
**Returns**: `Promise<{success: boolean, ipfsHash?: string, url?: string, error?: string}>`

#### `createNFTMetadata(params)`
**File**: `client/utils/ipfs.js`
**Description**: Create ERC-721 compliant metadata object
**Parameters**:
```javascript
{
  name: string,
  description: string,
  imageUrl: string,
  collection: string,
  attributes: Array<{trait_type: string, value: string}>
}
```
**Returns**: `Object` - ERC-721 metadata object

#### `createNFTOnIPFS(params)`
**File**: `client/utils/ipfs.js`
**Description**: Complete NFT creation workflow
**Parameters**:
```javascript
{
  imageFile: File,
  name: string,
  description: string,
  collection: string,
  attributes: Array<{trait_type: string, value: string}>
}
```
**Returns**: `Promise<{success: boolean, metadataUrl?: string, imageUrl?: string, error?: string}>`

### Configuration

#### `pinata`
**File**: `client/utils/config.js`
**Description**: Pinata SDK instance for IPFS operations
**Configuration**:
- JWT authentication
- Custom gateway URL

## 📦 State Management

### NFT Marketplace Store

#### `useNFTMarketplaceStore`
**File**: `client/store/contract-store.js`
**Description**: Zustand store for marketplace state management

#### Store State
```javascript
{
  // Wallet Connection
  account: string | null,
  chainId: number | null,
  provider: Object | null,
  
  // Contract Interaction
  contract: Object | null,
  
  // Loading States
  isLoading: boolean,
  
  // Error Handling
  error: string | null
}
```

#### Store Actions

##### `connectWallet(walletType)`
**Description**: Connect to specified wallet
**Parameters**:
- `walletType`: 'metamask' | 'brave' | 'walletconnect'
**Returns**: `Promise<void>`

##### `disconnectWallet()`
**Description**: Disconnect current wallet
**Returns**: `Promise<void>`

##### `createNFT(tokenURI, price)`
**Description**: Create and mint new NFT
**Parameters**:
- `tokenURI`: IPFS URI for metadata
- `price`: Listing price in ether
**Returns**: `Promise<void>`

##### `buyNFT(tokenId, price)`
**Description**: Purchase an NFT
**Parameters**:
- `tokenId`: Token ID to purchase
- `price`: Token price in ether
**Returns**: `Promise<void>`

##### `resellNFT(tokenId, price)`
**Description**: Relist an owned NFT
**Parameters**:
- `tokenId`: Token ID to resell
- `price`: New listing price in ether
**Returns**: `Promise<void>`

##### `fetchMarketplaceNFTs()`
**Description**: Load all available NFTs
**Returns**: `Promise<void>`

##### `fetchMyNFTs()`
**Description**: Load user's owned NFTs
**Returns**: `Promise<void>`

##### `fetchListedNFTs()`
**Description**: Load user's listed NFTs
**Returns**: `Promise<void>`

## 🚀 Installation and Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible wallet

### Backend Setup (Hardhat)

1. **Install dependencies**:
```bash
cd hardhat
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Compile contracts**:
```bash
npx hardhat compile
```

4. **Deploy contracts**:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Frontend Setup (Client)

1. **Install dependencies**:
```bash
cd client
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start development server**:
```bash
npm run dev
```

## 🎯 Usage Examples

### Creating an NFT

```javascript
import { createNFTOnIPFS } from '@/utils/ipfs';
import useNFTMarketplaceStore from '@/store/contract-store';

const { createNFT } = useNFTMarketplaceStore();

// 1. Upload to IPFS
const ipfsResult = await createNFTOnIPFS({
  imageFile: selectedFile,
  name: "My NFT",
  description: "Description of my NFT",
  collection: "Avengers",
  attributes: [
    { trait_type: "Rarity", value: "Legendary" },
    { trait_type: "Power", value: "100" }
  ]
});

// 2. Create NFT on blockchain
if (ipfsResult.success) {
  await createNFT(ipfsResult.metadataUrl, "0.1"); // 0.1 ETH
}
```

### Connecting Wallet

```javascript
import useNFTMarketplaceStore from '@/store/contract-store';

const { connectWallet } = useNFTMarketplaceStore();

// Connect to MetaMask
await connectWallet('metamask');

// Connect to WalletConnect
await connectWallet('walletconnect');
```

### Fetching NFTs

```javascript
import useNFTMarketplaceStore from '@/store/contract-store';

const { fetchMarketplaceNFTs, fetchMyNFTs } = useNFTMarketplaceStore();

// Load marketplace NFTs
await fetchMarketplaceNFTs();

// Load user's NFTs
await fetchMyNFTs();
```

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive validation on all inputs
- **Access Control**: Owner-only functions for critical operations
- **Price Limits**: Maximum price and supply constraints
- **Mint Limits**: Per-address minting restrictions

## 🧪 Testing

### Smart Contract Tests
```bash
cd hardhat
npx hardhat test
```

### Frontend Tests
```bash
cd client
npm run test
```

## 📝 License

This project is licensed under the MIT License.
