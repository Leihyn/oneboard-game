module oneopoly::property {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::url::{Self, Url};
    use sui::event;

    use oneopoly::board;

    // === Structs ===

    /// Dynamic NFT representing a property in OneOpoly.
    /// Owned by the player, evolves visually on upgrade.
    public struct PropertyNFT has key, store {
        id: UID,
        game_id: ID,
        space_index: u8,
        name: vector<u8>,
        level: u8,
        category: u8,
        image_url: Url,
    }

    // === NFT Management ===

    public(package) fun mint(
        game_id: ID,
        space_index: u8,
        name: vector<u8>,
        category: u8,
        owner: address,
        ctx: &mut TxContext,
    ): ID {
        let base_url = get_image_url(category, 0);
        let nft = PropertyNFT {
            id: object::new(ctx),
            game_id,
            space_index,
            name,
            level: 0,
            category,
            image_url: url::new_unsafe_from_bytes(base_url),
        };
        let nft_id = object::uid_to_inner(&nft.id);
        transfer::transfer(nft, owner);
        nft_id
    }

    public entry fun upgrade_nft(nft: &mut PropertyNFT) {
        let new_level = nft.level + 1;
        assert!(new_level <= board::max_upgrade_level(), 0);
        nft.level = new_level;
        nft.image_url = url::new_unsafe_from_bytes(get_image_url(nft.category, new_level));
    }

    // === Accessors ===

    public fun nft_game_id(nft: &PropertyNFT): ID { nft.game_id }
    public fun nft_space_index(nft: &PropertyNFT): u8 { nft.space_index }
    public fun nft_name(nft: &PropertyNFT): vector<u8> { nft.name }
    public fun nft_level(nft: &PropertyNFT): u8 { nft.level }
    public fun nft_category(nft: &PropertyNFT): u8 { nft.category }

    // === Image URL Helper ===

    fun get_image_url(category: u8, level: u8): vector<u8> {
        // Placeholder URLs - replace with actual IPFS/hosted URLs
        if (category == 0) {
            // Yield Farm
            if (level == 0) b"https://oneopoly.app/images/yield-farm-0.png"
            else if (level == 1) b"https://oneopoly.app/images/yield-farm-1.png"
            else b"https://oneopoly.app/images/yield-farm-2.png"
        } else if (category == 1) {
            // LP
            if (level == 0) b"https://oneopoly.app/images/lp-0.png"
            else if (level == 1) b"https://oneopoly.app/images/lp-1.png"
            else b"https://oneopoly.app/images/lp-2.png"
        } else if (category == 2) {
            // DEX
            if (level == 0) b"https://oneopoly.app/images/dex-0.png"
            else if (level == 1) b"https://oneopoly.app/images/dex-1.png"
            else b"https://oneopoly.app/images/dex-2.png"
        } else if (category == 3) {
            // Lending
            if (level == 0) b"https://oneopoly.app/images/lending-0.png"
            else if (level == 1) b"https://oneopoly.app/images/lending-1.png"
            else b"https://oneopoly.app/images/lending-2.png"
        } else {
            // Staking
            if (level == 0) b"https://oneopoly.app/images/staking-0.png"
            else if (level == 1) b"https://oneopoly.app/images/staking-1.png"
            else b"https://oneopoly.app/images/staking-2.png"
        }
    }
}
