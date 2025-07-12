"use client"

import { create } from 'zustand';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import toast from 'react-hot-toast';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC721IncorrectOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ERC721InsufficientApproval",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidOperator",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC721InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ERC721NonexistentToken",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EnforcedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExpectedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "approved",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "ApprovalForAll",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_fromTokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_toTokenId",
          "type": "uint256"
        }
      ],
      "name": "BatchMetadataUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "oldPrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newPrice",
          "type": "uint256"
        }
      ],
      "name": "ListingPriceUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "sold",
          "type": "bool"
        }
      ],
      "name": "MarketItemCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "MarketItemSold",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "name": "MarketplacePaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "name": "MarketplaceUnpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "_tokenId",
          "type": "uint256"
        }
      ],
      "name": "MetadataUpdate",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "TokenListed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "tokenURI",
          "type": "string"
        }
      ],
      "name": "TokenMinted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "MAX_MINTS_PER_ADDRESS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_PRICE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "MAX_SUPPLY",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "createMarketSale",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "tokenURI",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "createToken",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fetchItemsListed",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sold",
              "type": "bool"
            }
          ],
          "internalType": "struct NFTMarketplace.MarketItem[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fetchMarketItems",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sold",
              "type": "bool"
            }
          ],
          "internalType": "struct NFTMarketplace.MarketItem[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fetchMyNFTs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sold",
              "type": "bool"
            }
          ],
          "internalType": "struct NFTMarketplace.MarketItem[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getApproved",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getListingPrice",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getMarketItem",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "sold",
              "type": "bool"
            }
          ],
          "internalType": "struct NFTMarketplace.MarketItem",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "minter",
          "type": "address"
        }
      ],
      "name": "getMintCountByAddress",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalSold",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalTokens",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        }
      ],
      "name": "isApprovedForAll",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "isTokenListed",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "ownerOf",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "remainingSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "resellToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "safeTransferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "operator",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "approved",
          "type": "bool"
        }
      ],
      "name": "setApprovalForAll",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes4",
          "name": "interfaceId",
          "type": "bytes4"
        }
      ],
      "name": "supportsInterface",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "tokenURI",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_listingPrice",
          "type": "uint256"
        }
      ],
      "name": "updateListingPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

// WalletConnect configuration
const WC_PROJECT_ID = '9601996399f7776c59d80c3202e65abf';
const SUPPORTED_CHAIN_IDS = [1, 11155111];

const useNFTMarketplaceStore = create((set, get) => ({
    // Contract states
    contract: null,
    contractOwner: null,
    isPaused: false,

    // NFT Marketplace states
    marketItems: [],
    myNFTs: [],
    listedItems: [],
    listingPrice: 0,
    totalTokens: 0,
    totalSold: 0,
    maxSupply: 10000,
    maxMintsPerAddress: 20,
    userMintCount: 0,
    remainingSupply: 0,

    // Wallet states
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    wcProvider: null,
    loading: false,

    setLoading: (loading) => set({ loading }),

    executeContractCall: async (operationType, operation, ...args) => {
        try {
            set({ loading: true });
            const tx = await operation(...args);
            await tx.wait();
            await get().loadContractData();
            set({ loading: false });
            return tx;
        } catch (error) {
            console.error(`${operationType} operation failed:`, error);
            toast.error(`Failed to ${operationType}: ${error.message || error}`);
            set({ loading: false });
            return null;
        }
    },

    connectWallet: async (walletType) => {
      try {
          let rawProvider = null;
          let ethersProvider = null;

          switch (walletType) {
              case 'metamask':
                  if (window.ethereum && window.ethereum.isMetaMask) {
                      rawProvider = window.ethereum;
                      await rawProvider.request({ method: 'eth_requestAccounts' });
                      toast.success('Connected to MetaMask successfully!');
                  } else {
                      window.open('https://metamask.io/download/', '_blank');
                      toast.error('Please install MetaMask');
                      return;
                  }
                  break;

              case 'brave':
                  try {
                      if (window.navigator && window.navigator.brave) {
                          const isBraveBrowser = await window.navigator.brave.isBrave();
                          if (isBraveBrowser) {
                              if (window.ethereum && window.ethereum.isBraveWallet) {
                                  rawProvider = window.ethereum;
                                  await rawProvider.request({ method: 'eth_requestAccounts' });
                                  toast.success('Connected to Brave Wallet successfully!');
                              } else {
                                  toast.error('Enable Brave Wallet in your browser settings');
                                  setTimeout(() => {
                                      window.open('brave://settings/wallet', '_blank');
                                  }, 1000);
                                  return;
                              }
                          } else {
                              toast.error('Use Brave Browser with Brave Wallet enabled');
                              setTimeout(() => {
                                  window.open('https://brave.com/download/', '_blank');
                              }, 1000);
                              return;
                          }
                      } else {
                          toast.error('Use Brave Browser with Brave Wallet enabled');
                          setTimeout(() => {
                              window.open('https://brave.com/download/', '_blank');
                          }, 1000);
                          return;
                      }
                  } catch (error) {
                      console.error('Brave Wallet connection error:', error);
                      return;
                  }
                  break;

              case 'walletconnect':
                  try {
                      if (!get().wcProvider) {
                          rawProvider = await EthereumProvider.init({
                              projectId: WC_PROJECT_ID,
                              chains: SUPPORTED_CHAIN_IDS,
                              showQrModal: true,
                              metadata: {
                                  name: 'NFT Marketplace',
                                  description: 'Decentralized NFT Marketplace',
                                  url: window.location.origin
                              }
                          });
                          set({ wcProvider: rawProvider });
                      } else {
                          rawProvider = get().wcProvider;
                      }
                      await rawProvider.connect();
                      toast.success('Connected via WalletConnect');
                  } catch (error) {
                      console.error('WalletConnect initialization failed:', error);
                      toast.error('Failed to Connect , Try Again...');
                      return;
                  }
                  break;

              default:
                  toast.error('Unsupported wallet type');
                  return;
          }

          ethersProvider = new ethers.BrowserProvider(rawProvider);

          const setupEventListeners = () => {
              const handleAccountsChanged = async (accounts) => {
                  if (!accounts || accounts.length === 0) {
                      set({
                          account: null,
                          signer: null,
                          contract: null,
                          marketItems: [],
                          myNFTs: [],
                          listedItems: [],
                          listingPrice: 0,
                          totalTokens: 0,
                          totalSold: 0,
                          userMintCount: 0,
                          remainingSupply: 0,
                      });
                      toast.error('Disconnected: you disconnected from your wallet');
                  } else {
                      try {
                          const newSigner = await ethersProvider.getSigner();
                          const newAddress = await newSigner.getAddress();
                          const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
                          set({
                              signer: newSigner,
                              account: newAddress,
                              contract: newContract
                          });
                          toast.success(`Account changed: ${newAddress}`);
                          await get().loadContractData();
                      } catch (err) {
                          toast.error('Error updating after account change');
                      }
                  }
              };

              const handleChainChanged = async (chainIdHex) => {
                  try {
                      const numericChainId = Number(chainIdHex);
                      set({ chainId: numericChainId });
                      toast.success(`Network changed to chainId ${numericChainId}`);

                      const newSigner = await ethersProvider.getSigner();
                      const newAddress = await newSigner.getAddress();
                      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, newSigner);
                      set({
                          signer: newSigner,
                          account: newAddress,
                          contract: newContract
                      });

                      if (!SUPPORTED_CHAIN_IDS.includes(numericChainId)) {
                          toast.error(`Unsupported network (chainId ${numericChainId}). Please switch to a supported network.`);
                      } else {
                          await get().loadContractData();
                      }
                  } catch (err) {
                      toast.error('Error updating after network change');
                  }
              };

              const handleDisconnect = () => {
                  set({
                      account: null,
                      signer: null,
                      contract: null,
                      provider: null,
                      marketItems: [],
                      myNFTs: [],
                      listedItems: [],
                      listingPrice: 0,
                      totalTokens: 0,
                      totalSold: 0,
                      userMintCount: 0,
                      remainingSupply: 0,
                  });
                  toast.error('Wallet disconnected successfully');
              };

              rawProvider.on('accountsChanged', handleAccountsChanged);
              rawProvider.on('chainChanged', handleChainChanged);
              rawProvider.on('disconnect', handleDisconnect);

              rawProvider._nftMarketplaceEventHandlers = {
                  handleAccountsChanged,
                  handleChainChanged,
                  handleDisconnect
              };
          };

          setupEventListeners();

          const signer = await ethersProvider.getSigner();
          const address = await signer.getAddress();
          const network = await ethersProvider.getNetwork();
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

          set({
              provider: ethersProvider,
              signer,
              account: address,
              chainId: Number(network.chainId),
              contract,
              loading: false
          });

          await get().loadContractData();
          set({ isModalOpen: false });

          return { signer, address, network };
      } catch (error) {
          console.error('Wallet connection failed:', error);
          toast.error(error.message || 'Failed to connect wallet');
      }
    },

    disconnectWallet: async () => {
      try {
          const { wcProvider } = get();

          if (window.ethereum && window.ethereum._nftMarketplaceEventHandlers) {
              const { handleAccountsChanged, handleChainChanged, handleDisconnect } = window.ethereum._nftMarketplaceEventHandlers;
              window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
              window.ethereum.removeListener('chainChanged', handleChainChanged);
              window.ethereum.removeListener('disconnect', handleDisconnect);
              delete window.ethereum._nftMarketplaceEventHandlers;
          }

          if (wcProvider) {
              if (wcProvider._nftMarketplaceEventHandlers) {
                  const { handleAccountsChanged, handleChainChanged, handleDisconnect } = wcProvider._nftMarketplaceEventHandlers;
                  wcProvider.removeListener('accountsChanged', handleAccountsChanged);
                  wcProvider.removeListener('chainChanged', handleChainChanged);
                  wcProvider.removeListener('disconnect', handleDisconnect);
                  delete wcProvider._nftMarketplaceEventHandlers;
              }
              try {
                  await wcProvider.disconnect();
              } catch (err) {
                  console.warn('Error disconnecting WalletConnect provider:', err);
              }
          }

          set({
              account: null,
              chainId: null,
              provider: null,
              signer: null,
              contract: null,
              marketItems: [],
              myNFTs: [],
              listedItems: [],
              listingPrice: 0,
              totalTokens: 0,
              totalSold: 0,
              userMintCount: 0,
              remainingSupply: 0,
              wcProvider: null,
              loading: false
          });

          toast.success('Wallet disconnected');
      } catch (error) {
          console.error('Disconnect failed:', error);
          toast.error(error.message || 'Failed to disconnect wallet');
      }
    },

    loadContractData: async () => {
        try {
            const { contract, account } = get();
            if (!contract || !account) {
                toast.error('Please connect your wallet first');
                return;
            };

            set({ loading: true });

            const [
                marketItems,
                myNFTs,
                listedItems,
                listingPrice,
                totalTokens,
                totalSold,
                remainingSupply,
                userMintCount,
                isPaused,
                owner
            ] = await Promise.all([
                contract.fetchMarketItems(),
                account ? contract.fetchMyNFTs() : [],
                account ? contract.fetchItemsListed() : [],
                contract.getListingPrice(),
                contract.getTotalTokens(),
                contract.getTotalSold(),
                contract.remainingSupply(),
                account ? contract.getMintCountByAddress(account) : 0,
                contract.paused(),
                contract.owner()
            ]);

            set({
                marketItems,
                myNFTs,
                listedItems,
                listingPrice: ethers.formatEther(listingPrice),
                totalTokens: Number(totalTokens),
                totalSold: Number(totalSold),
                remainingSupply: Number(remainingSupply),
                userMintCount: Number(userMintCount),
                isPaused,
                contractOwner: owner,
                loading: false
            });
        } catch (error) {
            console.error('Failed to load contract data:', error);
            toast.error('Failed to load marketplace data');
            set({ loading: false });
        }
    },

    // CREATE TOKEN (mint and list)
    createToken: async (tokenURI, priceInEther) => {
        const { contract, listingPrice } = get();
        if (!contract) {
            toast.error('Wallet not connected, please connect your wallet');
            return null;
        }

        return get().executeContractCall(
            'create token',
            async () => contract.createToken(tokenURI, ethers.parseEther(priceInEther.toString()), {
                value: ethers.parseEther(listingPrice.toString())
            }),
            tokenURI, priceInEther
        );
    },

    // BUY NFT
    buyNFT: async (tokenId, priceInEther) => {
        const { contract , account} = get();
        if (!contract || !account) {
            toast.error('Wallet not connected, please connect your wallet');
            return null;
        }

        try {
            set({ loading: true });
            
            // First get the market item to verify the price
            const marketItem = await contract.getMarketItem(tokenId);
            const priceInWei = marketItem.price;
            
            const ownerOfNFT = await marketItem.owner;
            if (ownerOfNFT.toLowerCase() == account.toLowerCase()) {
                toast.error('You can not buy your own NFT that you created');
                set({ loading: false });
                return null;
            }
            
            // Execute the purchase transaction
            const tx = await contract.createMarketSale(tokenId, {
                value: priceInWei
            });
            
            await tx.wait();
            
            await get().loadContractData();
            
            set({ loading: false });
            return tx;
        } catch (error) {
            console.error('Buy NFT operation failed:', error);
            toast.error(`Failed to buy NFT: ${error.message || error}`);
            set({ loading: false });
            return null;
        }
    },

    // RESELL TOKEN
    resellToken: async (tokenId, priceInEther) => {
        const { contract,account, listingPrice } = get();
        if (!contract || !account) {
            toast.error('Wallet not connected, please connect your wallet');
            return null;
        }

        try {
            set({ loading: true });
            
            const marketItem = await contract.getMarketItem(tokenId);
            const ownerOfNFT = await marketItem.owner;
            if (ownerOfNFT.toLowerCase() !== account.toLowerCase()) {
                toast.error('You can only resell NFTs that you own');
                set({ loading: false });
                return null;
            }
            
            // Check if price is within allowed range
            const priceInWei = ethers.parseEther(priceInEther.toString());
            const minPrice = ethers.parseEther('0.001');
            const maxPrice = await contract.MAX_PRICE();
            
            if (priceInWei < minPrice) {
                toast.error('Price must be at least 0.001 ETH');
                set({ loading: false });
                return null;
            }
            
            if (priceInWei > maxPrice) {
                toast.error(`Price exceeds maximum allowed (${ethers.formatEther(maxPrice)} ETH)`);
                set({ loading: false });
                return null;
            }
            
            // Execute the resell transaction
            const tx = await contract.resellToken(tokenId, priceInWei, {
                value: ethers.parseEther(listingPrice.toString())
            });
            
            await tx.wait();
           
            await get().loadContractData();
            
            set({ loading: false });
            return tx;
        } catch (error) {
            console.error('Resell token operation failed:', error);
            toast.error(`Failed to resell token: ${error.message || error}`);
            set({ loading: false });
            return null;
        }
    },

    // FETCH MARKET ITEMS (unsold items for sale)
    fetchMarketItems: async () => {
        try {
            const { contract } = get();
            if (!contract) {
                toast.error('Wallet not connected');
                return [];
            }
            
            set({ loading: true });
            const items = await contract.fetchMarketItems();
            
            const processedItems = items.map(item => ({
                tokenId: Number(item.tokenId),
                seller: item.seller,
                owner: item.owner,
                price: ethers.formatEther(item.price),
                priceWei: item.price.toString(),
                sold: item.sold
            }));
            
            set({ loading: false });
            return processedItems;
        } catch (error) {
            console.error('Failed to fetch market items:', error);
            toast.error('Failed to load marketplace items');
            set({ loading: false });
            return [];
        }
    },

     // FETCH MY NFTs (items owned by the user)
     fetchMyNFTs: async () => {
        try {
            const { contract, account } = get();
            if (!contract || !account) {
                toast.error('Wallet not connected');
                return [];
            }
            
            set({ loading: true });
            const items = await contract.fetchMyNFTs();
            
            // Process the items to make them more usable in the frontend
            const processedItems = items.map(item => ({
                tokenId: Number(item.tokenId),
                seller: item.seller,
                owner: item.owner,
                price: ethers.formatEther(item.price),
                priceWei: item.price.toString(),
                sold: item.sold
            }));
            
            set({ loading: false });
            return processedItems;
        } catch (error) {
            console.error('Failed to fetch my NFTs:', error);
            toast.error('Failed to load your NFTs');
            set({ loading: false });
            return [];
        }
    },

     // FETCH ITEMS LISTED (items listed by the user)
     fetchItemsListed: async () => {
        try {
            const { contract, account } = get();
            if (!contract || !account) {
                toast.error('Wallet not connected');
                return [];
            }
            
            set({ loading: true });
            const items = await contract.fetchItemsListed();
            
            // Process the items to make them more usable in the frontend
            const processedItems = items.map(item => ({
                tokenId: Number(item.tokenId),
                seller: item.seller,
                owner: item.owner,
                price: ethers.formatEther(item.price),
                priceWei: item.price.toString(),
                sold: item.sold
            }));
            
            set({ loading: false });
            return processedItems;
        } catch (error) {
            console.error('Failed to fetch listed items:', error);
            toast.error('Failed to load your listed items');
            set({ loading: false });
            return [];
        }
    },

    // GET MARKET ITEM DETAILS FOR A SPECIFIC TOKEN ID
    getMarketItem: async (tokenId) => {
        try {
            const { contract } = get();
            if (!contract) {
                toast.error('Wallet not connected');
                return null;
            }
            
            const item = await contract.getMarketItem(tokenId);
            
            return {
                tokenId: Number(item.tokenId),
                seller: item.seller,
                owner: item.owner,
                price: ethers.formatEther(item.price),
                priceWei: item.price.toString(),
                sold: item.sold
            };
        } catch (error) {
            console.error('Failed to get market item:', error);
            toast.error('Failed to get item details');
            return null;
        }
    },

    // FETCH TOKEN METADATA FOR A SPECIFIC TOKEN ID
    fetchTokenMetadata: async (tokenId) => {
        try {
            const { contract } = get();
            if (!contract) {
                toast.error('Wallet not connected');
                return null;
            }
            
            const tokenURI = await contract.tokenURI(tokenId);
            if (!tokenURI) return null;
            
            // Handle IPFS URLs
            const url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
            const response = await fetch(url);
            const metadata = await response.json();
            
            // Handle IPFS image URLs
            if (metadata.image) {
                metadata.image = metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/");
            }
            
            return metadata;
        } catch (error) {
            console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
            return null;
        }
    },

    // UPDATE LISTING PRICE (owner only)
    updateListingPrice: async (newPriceInEther) => {
        const { contract, account, contractOwner } = get();
        if (!contract) {
            toast.error('Wallet not connected, please connect your wallet');
            return null;
        }
        
        if (account.toLowerCase() !== contractOwner.toLowerCase()) {
            toast.error('Only contract owner can update listing price');
            return null;
        }

        return get().executeContractCall(
            'update listing price',
            async () => contract.updateListingPrice(ethers.parseEther(newPriceInEther.toString())),
            newPriceInEther
        );
    },

    // Pause contract (owner only)
    pauseContract: async () => {
        const { contract, account, contractOwner } = get();
        if (!contract) {
            toast.error('Wallet not connected, please connect your wallet');
            return null;
        }
        
        if (account.toLowerCase() !== contractOwner.toLowerCase()) {
            toast.error('Only contract owner can pause the contract');
            return null;
        }

        return get().executeContractCall(
            'pause contract',
            async () => contract.pause()
        );
    },

    // Unpause contract (owner only)
    unpauseContract: async () => {
        const { contract, account, contractOwner } = get();
        if (!contract) {
            toast.error('Wallet not connected, please connect your wallet');
            return null;
        }
        
        if (account.toLowerCase() !== contractOwner.toLowerCase()) {
            toast.error('Only contract owner can unpause the contract');
            return null;
        }

        return get().executeContractCall(
            'unpause contract',
            async () => contract.unpause()
        );
    },

     // Helper functions
     formatEther: (wei) => ethers.formatEther(wei),
     parseEther: (ether) => ethers.parseEther(ether.toString()),
}));         

export default useNFTMarketplaceStore;