module oneopoly::token {
    use sui::coin::{Self, TreasuryCap, Coin};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// OTW for token creation
    public struct TOKEN has drop {}

    fun init(witness: TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            9,
            b"ONP",
            b"OneOpoly Token",
            b"Game token for OneOpoly - DeFi board game on OneChain",
            option::none(),
            ctx,
        );
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    public entry fun mint_to_player(
        cap: &mut TreasuryCap<TOKEN>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        let coins = coin::mint(cap, amount, ctx);
        transfer::public_transfer(coins, recipient);
    }

    public entry fun burn(
        cap: &mut TreasuryCap<TOKEN>,
        coin: Coin<TOKEN>,
    ) {
        coin::burn(cap, coin);
    }
}
