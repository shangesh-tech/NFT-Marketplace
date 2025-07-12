// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/// @title Avengers & Transformers NFT Marketplace
/// @author Shangesh S
/// @notice This contract implements an NFT marketplace for Avengers and Transformers collectibles
/// @dev Includes security features like ReentrancyGuard and Pausable
contract NFTMarketplace is ERC721URIStorage, ReentrancyGuard, Pausable {
    uint256 private _currentTokenId;
    uint256 private _totalItemsSold;
    uint256 listingPrice = 0.0001 ether;
    address public owner;

    uint256 public constant MAX_PRICE = 1000 ether;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_MINTS_PER_ADDRESS = 20;

    // Track mints per address
    mapping(address => uint256) private _mintsPerAddress;

    struct MarketItem {
        uint256 tokenId;
        address seller;
        address owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => bool) private _tokenIdTracker;

    event MarketItemCreated(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice);

    event TokenListed(uint256 indexed tokenId, uint256 price);

    event MarketplacePaused(address admin);
    event MarketplaceUnpaused(address admin);

    event TokenMinted(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("Avengers & Transformers", "AVTF") {
        owner = msg.sender;
        _currentTokenId = 0;
        _totalItemsSold = 0;
    }

    /// @notice Ensures only owner can call function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    /// @notice Updates the listing price of the contract
    /// @param _listingPrice New listing price
    function updateListingPrice(uint _listingPrice) public onlyOwner {
        require(_listingPrice > 0, "Listing price must be greater than 0");
        uint256 oldPrice = listingPrice;
        listingPrice = _listingPrice;
        emit ListingPriceUpdated(oldPrice, _listingPrice);
    }

    /// @notice Returns the listing price of the contract
    /// @return Current listing price
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /// @notice Mints a token and lists it in the marketplace
    /// @param tokenURI The token URI for metadata
    /// @param price The listing price in wei
    /// @return The ID of the newly created token
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable nonReentrant whenNotPaused returns (uint) {
        require(price > 0.001 ether, "Price must be at least 0.001 ether");
        require(price <= MAX_PRICE, "Price exceeds maximum allowed");
        require(
            msg.value == listingPrice,
            "Must pay listing price 0.0001 ether to create and list the token"
        );
        require(bytes(tokenURI).length > 0, "Metadata URI cannot be empty");
        require(_currentTokenId < MAX_SUPPLY, "Maximum NFT supply reached");
        require(
            _mintsPerAddress[msg.sender] < MAX_MINTS_PER_ADDRESS,
            "Exceeded maximum mints per address"
        );

        _currentTokenId++;
        uint256 newTokenId = _currentTokenId;

        _tokenIdTracker[newTokenId] = true;

        _mintsPerAddress[msg.sender]++;

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit TokenMinted(newTokenId, tokenURI);

        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    /// @notice Creates a marketplace item for sale
    /// @param tokenId The token ID
    /// @param price The price for the item
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(tokenId > 0, "Token ID must be greater than zero");
        require(
            _tokenIdTracker[tokenId],
            "Token must be created in this marketplace"
        );

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId); // Transfer the token to the marketplace address
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    /// @notice Check if a token exists
    /// @param tokenId The token ID to check
    /// @return bool Whether the token exists
    function _tokenExists(uint256 tokenId) internal view returns (bool) {
        return
            tokenId > 0 &&
            _tokenIdTracker[tokenId] &&
            _ownerOf(tokenId) != address(0);
    }

    /// @notice Allows someone to resell a token they have purchased
    /// @param tokenId The token ID to resell
    /// @param price The new price
    function resellToken(
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant whenNotPaused {
        require(_tokenExists(tokenId), "Token does not exist");
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can resell the token"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price 0.0001 ether to resell the token"
        );
        require(price > 0.001 ether, "Price must be at least 0.001 ether");
        require(price <= MAX_PRICE, "Price exceeds maximum allowed");

        if (idToMarketItem[tokenId].sold) {
            _totalItemsSold--;
        }

        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = msg.sender;
        idToMarketItem[tokenId].owner = address(this);

        _transfer(msg.sender, address(this), tokenId); // Transfer the token to the marketplace address
        emit TokenListed(tokenId, price);
    }

    /// @notice Creates the sale of a marketplace item
    /// @param tokenId The token ID to purchase
    function createMarketSale(
        uint256 tokenId
    ) public payable nonReentrant whenNotPaused {
        require(_tokenExists(tokenId), "Token does not exist");
        require(
            idToMarketItem[tokenId].owner == address(this),
            "Item not for sale"
        );
        require(!idToMarketItem[tokenId].sold, "Item already sold");

        uint256 price = idToMarketItem[tokenId].price;
        address seller = idToMarketItem[tokenId].seller;

        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        require(seller != address(0), "Invalid seller address");
        require(msg.sender != seller, "Seller cannot buy their own item");

        idToMarketItem[tokenId].owner = msg.sender;
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = address(0);
        _totalItemsSold++;

        _transfer(address(this), msg.sender, tokenId); // Transfer the token to the buyer

        payable(owner).transfer(listingPrice);
        payable(seller).transfer(msg.value);

        emit MarketItemSold(tokenId, seller, msg.sender, price);
    }

    /// @notice Returns all unsold market items for sale
    /// @return Array of unsold market items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _currentTokenId;
        uint256 unsoldItemCount = 0;

        for (uint256 i = 1; i <= itemCount; i++) {
            if (
                _tokenIdTracker[i] &&
                idToMarketItem[i].owner == address(this) &&
                !idToMarketItem[i].sold
            ) {
                unsoldItemCount++;
            }
        }

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= itemCount; i++) {
            if (
                _tokenIdTracker[i] &&
                idToMarketItem[i].owner == address(this) &&
                !idToMarketItem[i].sold
            ) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }

        return items;
    }

    /// @notice Returns only items that a user has purchased
    /// @return Array of purchased items
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _currentTokenId;
        uint256 itemCount = 0;

        // Count user's NFTs
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_tokenIdTracker[i] && idToMarketItem[i].owner == msg.sender) {
                itemCount++;
            }
        }

        // Create array of user's NFTs
        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (_tokenIdTracker[i] && idToMarketItem[i].owner == msg.sender) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }

        return items;
    }

    /// @notice Returns only items a user has listed
    /// @return Array of listed items
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _currentTokenId;
        uint256 itemCount = 0;

        // Count user's listed items
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (
                _tokenIdTracker[i] &&
                idToMarketItem[i].seller == msg.sender &&
                !idToMarketItem[i].sold
            ) {
                itemCount++;
            }
        }

        // Create array of user's listed items
        MarketItem[] memory items = new MarketItem[](itemCount);
        uint256 currentIndex = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (
                _tokenIdTracker[i] &&
                idToMarketItem[i].seller == msg.sender &&
                !idToMarketItem[i].sold
            ) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }

        return items;
    }

    /// @notice Get details of a specific market item
    /// @param tokenId The token ID to query
    /// @return The market item details
    function getMarketItem(
        uint256 tokenId
    ) public view returns (MarketItem memory) {
        require(_tokenExists(tokenId), "Token does not exist");
        return idToMarketItem[tokenId];
    }

    /// @notice Pause the marketplace in case of emergency
    function pause() public onlyOwner {
        _pause();
        emit MarketplacePaused(msg.sender);
    }

    /// @notice Unpause the marketplace
    function unpause() public onlyOwner {
        _unpause();
        emit MarketplaceUnpaused(msg.sender);
    }

    /// @notice Get total number of tokens created
    function getTotalTokens() public view returns (uint256) {
        return _currentTokenId;
    }

    /// @notice Get total number of tokens sold
    function getTotalSold() public view returns (uint256) {
        return _totalItemsSold;
    }

    /// @notice Check if a token is currently listed for sale
    /// @param tokenId The token ID to check
    /// @return Whether the token is listed for sale
    function isTokenListed(uint256 tokenId) public view returns (bool) {
        return
            _tokenExists(tokenId) &&
            idToMarketItem[tokenId].owner == address(this) &&
            !idToMarketItem[tokenId].sold;
    }

    /// @notice Get the number of NFTs minted by an address
    /// @param minter The address to check
    /// @return Number of NFTs minted
    function getMintCountByAddress(
        address minter
    ) public view returns (uint256) {
        return _mintsPerAddress[minter];
    }

    /// @notice Get the remaining supply available to mint
    /// @return Remaining supply
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - _currentTokenId;
    }
}
