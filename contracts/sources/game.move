module oneopoly::game {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::hash;
    use sui::bcs;
    use sui::table::{Self, Table};

    use oneopoly::board::{Self, Board};
    use oneopoly::player::{Self, PlayerState};
    use oneopoly::property;

    // === Constants ===
    const STATUS_LOBBY: u8 = 0;
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_FINISHED: u8 = 2;

    const CHANCE_BONUS: u64 = 300;
    const TAX_AMOUNT: u64 = 200;
    const JAIL_DURATION: u8 = 2;
    const AIRDROP_BONUS: u64 = 400;
    const GOVERNANCE_BONUS: u64 = 250;
    const RUG_PULL_PERCENT: u64 = 50;
    const MAX_HUMAN_PLAYERS: u64 = 4;

    // === Errors ===
    const EGameNotActive: u64 = 200;
    const ENotYourTurn: u64 = 201;
    const EPropertyAlreadyOwned: u64 = 203;
    const ENotOnProperty: u64 = 204;
    const ECannotAfford: u64 = 205;
    const EAlreadyMaxLevel: u64 = 206;
    const ENotPropertyOwner: u64 = 207;
    const EPlayerIsBankrupt: u64 = 208;
    const EInvalidAIIndex: u64 = 209;
    const ENotAIPlayer: u64 = 210;
    const EMustRollFirst: u64 = 211;
    const EAlreadyRolled: u64 = 212;
    const EGameNotLobby: u64 = 213;
    const EGameFull: u64 = 214;
    const EAlreadyJoined: u64 = 215;
    const ENotCreator: u64 = 216;

    // === Event Structs ===

    public struct GameCreated has copy, drop { game_id: ID, creator: address, mode: u8 }
    public struct PlayerJoined has copy, drop { game_id: ID, player: address, player_count: u64 }
    public struct GameStarted has copy, drop { game_id: ID, player_count: u64 }
    public struct GameEnded has copy, drop { game_id: ID, winner: address, total_turns: u64 }
    public struct DiceRolled has copy, drop { game_id: ID, player: address, roll: u8, new_position: u8 }
    public struct TurnEnded has copy, drop { game_id: ID, next_player: address, turn_number: u64 }
    public struct PropertyPurchased has copy, drop { game_id: ID, player: address, space_index: u8, price: u64, nft_id: ID }
    public struct RentPaid has copy, drop { game_id: ID, payer: address, owner: address, space_index: u8, amount: u64 }
    public struct PropertyUpgraded has copy, drop { game_id: ID, player: address, space_index: u8, new_level: u8 }
    public struct PlayerBankrupt has copy, drop { game_id: ID, player: address }

    // === Game Object ===

    public struct Game has key {
        id: UID,
        board: Board,
        players: vector<PlayerState>,
        current_turn: u64,
        turn_number: u64,
        status: u8,
        winner: address,
        creator: address,
        mode: u8, // 0 = solo (vs AI), 1 = PvP (no AI), 2 = PvP+AI (humans + AI fill)
        max_players: u64,
        property_owners: Table<u8, u64>,
        property_levels: Table<u8, u8>,
        has_rolled: bool,
    }

    // === Game Lifecycle ===

    /// Create a solo game (1 human + 3 AI)
    public entry fun create_game(clock: &Clock, ctx: &mut TxContext) {
        let creator = tx_context::sender(ctx);
        let mut game = Game {
            id: object::new(ctx),
            board: board::create_board(),
            players: vector::empty(),
            current_turn: 0,
            turn_number: 0,
            status: STATUS_ACTIVE,
            winner: @0x0,
            creator,
            mode: 0,
            max_players: 4,
            property_owners: table::new(ctx),
            property_levels: table::new(ctx),
            has_rolled: false,
        };

        vector::push_back(&mut game.players, player::new_human(creator));

        let ai1_addr = derive_ai_address(creator, 1);
        let ai2_addr = derive_ai_address(creator, 2);
        let ai3_addr = derive_ai_address(creator, 3);
        vector::push_back(&mut game.players, player::new_ai(ai1_addr, player::ai_degen()));
        vector::push_back(&mut game.players, player::new_ai(ai2_addr, player::ai_whale()));
        vector::push_back(&mut game.players, player::new_ai(ai3_addr, player::ai_mev_bot()));

        let game_id = object::uid_to_inner(&game.id);
        event::emit(GameCreated { game_id, creator, mode: 0 });
        event::emit(GameStarted { game_id, player_count: 4 });

        transfer::share_object(game);
    }

    /// Create a PvP lobby (2-4 human players, no AI)
    public entry fun create_pvp_game(max_players: u64, ctx: &mut TxContext) {
        let creator = tx_context::sender(ctx);
        assert!(max_players >= 2 && max_players <= MAX_HUMAN_PLAYERS, EGameFull);

        let mut game = Game {
            id: object::new(ctx),
            board: board::create_board(),
            players: vector::empty(),
            current_turn: 0,
            turn_number: 0,
            status: STATUS_LOBBY,
            winner: @0x0,
            creator,
            mode: 1,
            max_players,
            property_owners: table::new(ctx),
            property_levels: table::new(ctx),
            has_rolled: false,
        };

        vector::push_back(&mut game.players, player::new_human(creator));

        let game_id = object::uid_to_inner(&game.id);
        event::emit(GameCreated { game_id, creator, mode: 1 });
        event::emit(PlayerJoined { game_id, player: creator, player_count: 1 });

        transfer::share_object(game);
    }

    /// Join a PvP lobby
    public entry fun join_game(game: &mut Game, ctx: &mut TxContext) {
        assert!(game.status == STATUS_LOBBY, EGameNotLobby);
        let joiner = tx_context::sender(ctx);
        let count = vector::length(&game.players);
        assert!(count < game.max_players, EGameFull);

        // Check not already joined
        let mut i = 0u64;
        while (i < count) {
            assert!(player::addr(vector::borrow(&game.players, i)) != joiner, EAlreadyJoined);
            i = i + 1;
        };

        vector::push_back(&mut game.players, player::new_human(joiner));
        let new_count = vector::length(&game.players);
        let game_id = object::uid_to_inner(&game.id);
        event::emit(PlayerJoined { game_id, player: joiner, player_count: new_count });
    }

    /// Start a PvP game (creator only, needs at least 2 players)
    public entry fun start_game(game: &mut Game, ctx: &mut TxContext) {
        assert!(game.status == STATUS_LOBBY, EGameNotLobby);
        assert!(tx_context::sender(ctx) == game.creator, ENotCreator);
        assert!(vector::length(&game.players) >= 2, EGameFull);

        game.status = STATUS_ACTIVE;
        let game_id = object::uid_to_inner(&game.id);
        event::emit(GameStarted { game_id, player_count: vector::length(&game.players) });
    }

    // === Player Actions ===

    public entry fun roll_dice(game: &mut Game, clock: &Clock, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let turn = game.current_turn;
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(!game.has_rolled, EAlreadyRolled);
        let current_player = vector::borrow(&game.players, turn);
        assert!(player::addr(current_player) == sender, ENotYourTurn);
        assert!(!player::is_bankrupt(current_player), EPlayerIsBankrupt);
        process_roll(game, turn, clock);
    }

    public entry fun buy_property(game: &mut Game, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let turn = game.current_turn;
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        let current_player = vector::borrow(&game.players, turn);
        assert!(player::addr(current_player) == sender, ENotYourTurn);
        process_buy(game, turn, ctx);
    }

    public entry fun skip_buy(game: &mut Game, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let turn = game.current_turn;
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        let current_player = vector::borrow(&game.players, turn);
        assert!(player::addr(current_player) == sender, ENotYourTurn);
    }

    public entry fun upgrade_property(game: &mut Game, nft: &mut property::PropertyNFT, space_index: u8, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let turn = game.current_turn;
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        let current_player = vector::borrow(&game.players, turn);
        assert!(player::addr(current_player) == sender, ENotYourTurn);
        process_upgrade(game, turn, space_index);
        // Update the NFT on-chain
        property::upgrade_nft(nft);
    }

    public entry fun end_turn(game: &mut Game, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let turn = game.current_turn;
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        let current_player = vector::borrow(&game.players, turn);
        assert!(player::addr(current_player) == sender, ENotYourTurn);
        advance_turn(game);
    }

    // === AI Actions ===

    public fun ai_roll_dice(game: &mut Game, player_index: u64, clock: &Clock) {
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(!game.has_rolled, EAlreadyRolled);
        assert!(player_index < vector::length(&game.players), EInvalidAIIndex);
        assert!(game.current_turn == player_index, ENotYourTurn);
        let current_player = vector::borrow(&game.players, player_index);
        assert!(player::is_ai(current_player), ENotAIPlayer);
        assert!(!player::is_bankrupt(current_player), EPlayerIsBankrupt);
        process_roll(game, player_index, clock);
    }

    public fun ai_buy_property(game: &mut Game, player_index: u64, ctx: &mut TxContext) {
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        assert!(player_index < vector::length(&game.players), EInvalidAIIndex);
        assert!(game.current_turn == player_index, ENotYourTurn);
        let current_player = vector::borrow(&game.players, player_index);
        assert!(player::is_ai(current_player), ENotAIPlayer);
        process_buy(game, player_index, ctx);
    }

    public fun ai_upgrade_property(game: &mut Game, player_index: u64, space_index: u8) {
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        assert!(player_index < vector::length(&game.players), EInvalidAIIndex);
        assert!(game.current_turn == player_index, ENotYourTurn);
        let current_player = vector::borrow(&game.players, player_index);
        assert!(player::is_ai(current_player), ENotAIPlayer);
        process_upgrade(game, player_index, space_index);
    }

    public fun ai_end_turn(game: &mut Game, player_index: u64) {
        assert!(game.status == STATUS_ACTIVE, EGameNotActive);
        assert!(game.has_rolled, EMustRollFirst);
        assert!(player_index < vector::length(&game.players), EInvalidAIIndex);
        assert!(game.current_turn == player_index, ENotYourTurn);
        let current_player = vector::borrow(&game.players, player_index);
        assert!(player::is_ai(current_player), ENotAIPlayer);
        advance_turn(game);
    }

    // === Standalone NFT Minting (Option C - Workshop) ===

    public entry fun mint_demo_nft(
        space_index: u8,
        ctx: &mut TxContext,
    ) {
        let sender = tx_context::sender(ctx);
        let board = board::create_board();
        let space = board::get_space(&board, space_index);
        assert!(board::is_property(space), ENotOnProperty);

        let game_id = object::new(ctx);
        let gid = object::uid_to_inner(&game_id);
        object::delete(game_id);

        property::mint(
            gid,
            space_index,
            board::space_name(space),
            board::space_category(space),
            sender,
            ctx,
        );
    }

    // === Internal Logic ===

    fun process_roll(game: &mut Game, player_index: u64, clock: &Clock) {
        let game_id = object::uid_to_inner(&game.id);
        let roll = generate_dice_roll(game, clock);

        let player = vector::borrow_mut(&mut game.players, player_index);
        let old_position = player::position(player);
        let new_position = (old_position + roll) % board::board_size();

        if (new_position < old_position && old_position != 0) {
            player::add_balance(player, player::start_pass_bonus());
        };

        player::set_position(player, new_position);
        let player_addr = player::addr(player);

        event::emit(DiceRolled { game_id, player: player_addr, roll, new_position });

        let space = board::get_space(&game.board, new_position);

        if (board::is_tax(space)) {
            let player = vector::borrow_mut(&mut game.players, player_index);
            player::deduct_balance(player, TAX_AMOUNT);
            if (player::is_bankrupt(player)) {
                event::emit(PlayerBankrupt { game_id, player: player::addr(player) });
            };
        } else if (board::is_jail(space)) {
            let player = vector::borrow_mut(&mut game.players, player_index);
            player::set_jail(player, JAIL_DURATION);
        } else if (board::is_chance(space)) {
            let player = vector::borrow_mut(&mut game.players, player_index);
            player::add_balance(player, CHANCE_BONUS);
        } else if (board::is_airdrop(space)) {
            let player = vector::borrow_mut(&mut game.players, player_index);
            player::add_balance(player, AIRDROP_BONUS);
        } else if (board::is_rug_pull(space)) {
            let player = vector::borrow_mut(&mut game.players, player_index);
            let current_balance = player::balance(player);
            let loss = current_balance * RUG_PULL_PERCENT / 100;
            player::deduct_balance(player, loss);
            if (player::is_bankrupt(player)) {
                event::emit(PlayerBankrupt { game_id, player: player::addr(player) });
            };
        } else if (board::is_governance(space)) {
            let player = vector::borrow_mut(&mut game.players, player_index);
            player::add_balance(player, GOVERNANCE_BONUS);
        } else if (board::is_property(space)) {
            if (table::contains(&game.property_owners, new_position)) {
                let owner_index = *table::borrow(&game.property_owners, new_position);
                if (owner_index != player_index) {
                    let level = *table::borrow(&game.property_levels, new_position);
                    let rent = board::calculate_rent(space, level);
                    let owner_addr = player::addr(vector::borrow(&game.players, owner_index));
                    let payer_addr = player::addr(vector::borrow(&game.players, player_index));

                    let payer = vector::borrow_mut(&mut game.players, player_index);
                    player::deduct_balance(payer, rent);
                    let went_bankrupt = player::is_bankrupt(payer);

                    let owner = vector::borrow_mut(&mut game.players, owner_index);
                    player::add_balance(owner, rent);

                    event::emit(RentPaid { game_id, payer: payer_addr, owner: owner_addr, space_index: new_position, amount: rent });
                    if (went_bankrupt) {
                        event::emit(PlayerBankrupt { game_id, player: payer_addr });
                    };
                };
            };
        };

        check_game_over(game);
        game.has_rolled = true;
    }

    fun process_buy(game: &mut Game, player_index: u64, ctx: &mut TxContext) {
        let game_id = object::uid_to_inner(&game.id);
        let player_pos = player::position(vector::borrow(&game.players, player_index));
        let space = board::get_space(&game.board, player_pos);

        assert!(board::is_property(space), ENotOnProperty);
        assert!(!table::contains(&game.property_owners, player_pos), EPropertyAlreadyOwned);

        let price = board::space_base_price(space);
        let player = vector::borrow(&game.players, player_index);
        assert!(player::can_afford(player, price), ECannotAfford);

        let player = vector::borrow_mut(&mut game.players, player_index);
        player::deduct_balance(player, price);
        player::add_property(player, player_pos);
        let player_addr = player::addr(player);

        table::add(&mut game.property_owners, player_pos, player_index);
        table::add(&mut game.property_levels, player_pos, 0);

        // Mint NFT for human players only
        let is_human = !player::is_ai(vector::borrow(&game.players, player_index));
        let nft_id = if (is_human) {
            property::mint(
                game_id,
                player_pos,
                board::space_name(space),
                board::space_category(space),
                player_addr,
                ctx,
            )
        } else {
            // For AI, create a dummy ID
            object::id_from_address(@0x0)
        };

        event::emit(PropertyPurchased { game_id, player: player_addr, space_index: player_pos, price, nft_id });
    }

    fun process_upgrade(game: &mut Game, player_index: u64, space_index: u8) {
        let game_id = object::uid_to_inner(&game.id);

        assert!(table::contains(&game.property_owners, space_index), ENotOnProperty);
        let owner_index = *table::borrow(&game.property_owners, space_index);
        assert!(owner_index == player_index, ENotPropertyOwner);

        let current_level = *table::borrow(&game.property_levels, space_index);
        assert!(current_level < board::max_upgrade_level(), EAlreadyMaxLevel);

        let space = board::get_space(&game.board, space_index);
        let cost = board::upgrade_cost(space, current_level);
        let player = vector::borrow(&game.players, player_index);
        assert!(player::can_afford(player, cost), ECannotAfford);

        let player = vector::borrow_mut(&mut game.players, player_index);
        player::deduct_balance(player, cost);
        let player_addr = player::addr(player);

        let new_level = current_level + 1;
        *table::borrow_mut(&mut game.property_levels, space_index) = new_level;

        event::emit(PropertyUpgraded { game_id, player: player_addr, space_index, new_level });
    }

    fun advance_turn(game: &mut Game) {
        let game_id = object::uid_to_inner(&game.id);
        game.has_rolled = false;
        game.turn_number = game.turn_number + 1;

        let num_players = vector::length(&game.players);
        let mut next = (game.current_turn + 1) % num_players;
        let mut checked = 0u64;

        while (checked < num_players) {
            let p = vector::borrow(&game.players, next);
            if (!player::is_bankrupt(p)) {
                break
            };
            next = (next + 1) % num_players;
            checked = checked + 1;
        };

        let next_player = vector::borrow_mut(&mut game.players, next);
        player::decrement_jail(next_player);

        game.current_turn = next;

        let next_addr = player::addr(vector::borrow(&game.players, next));
        event::emit(TurnEnded { game_id, next_player: next_addr, turn_number: game.turn_number });
    }

    fun check_game_over(game: &mut Game) {
        let mut alive_count = 0u64;
        let mut last_alive = 0u64;
        let len = vector::length(&game.players);
        let mut i = 0u64;

        while (i < len) {
            let p = vector::borrow(&game.players, i);
            if (!player::is_bankrupt(p)) {
                alive_count = alive_count + 1;
                last_alive = i;
            };
            i = i + 1;
        };

        if (alive_count <= 1) {
            game.status = STATUS_FINISHED;
            let winner = vector::borrow(&game.players, last_alive);
            game.winner = player::addr(winner);
            let game_id = object::uid_to_inner(&game.id);
            event::emit(GameEnded { game_id, winner: game.winner, total_turns: game.turn_number });
        };
    }

    fun generate_dice_roll(game: &Game, clock: &Clock): u8 {
        let timestamp = clock::timestamp_ms(clock);
        let game_id_bytes = object::uid_to_bytes(&game.id);
        let turn_bytes = bcs::to_bytes(&game.turn_number);

        let mut seed_data = vector::empty<u8>();
        vector::append(&mut seed_data, game_id_bytes);
        vector::append(&mut seed_data, turn_bytes);
        vector::append(&mut seed_data, bcs::to_bytes(&timestamp));

        let hash = hash::keccak256(&seed_data);
        let first_byte = *vector::borrow(&hash, 0);
        (first_byte % 6) + 1
    }

    fun derive_ai_address(creator: address, index: u8): address {
        let mut seed = bcs::to_bytes(&creator);
        vector::push_back(&mut seed, index);
        let hash = hash::keccak256(&seed);
        let mut addr_bytes = vector::empty<u8>();
        let mut i = 0u8;
        while (i < 32) {
            vector::push_back(&mut addr_bytes, *vector::borrow(&hash, (i as u64)));
            i = i + 1;
        };
        sui::address::from_bytes(addr_bytes)
    }

    // === View Functions ===

    public fun game_status(game: &Game): u8 { game.status }
    public fun current_turn(game: &Game): u64 { game.current_turn }
    public fun turn_number(game: &Game): u64 { game.turn_number }
    public fun winner(game: &Game): address { game.winner }
    public fun has_rolled(game: &Game): bool { game.has_rolled }
    public fun game_mode(game: &Game): u8 { game.mode }
    public fun game_creator(game: &Game): address { game.creator }
    public fun game_max_players(game: &Game): u64 { game.max_players }

    public fun get_player(game: &Game, index: u64): &PlayerState {
        vector::borrow(&game.players, index)
    }

    public fun player_count(game: &Game): u64 {
        vector::length(&game.players)
    }

    public fun get_property_owner(game: &Game, space_index: u8): (bool, u64) {
        if (table::contains(&game.property_owners, space_index)) {
            (true, *table::borrow(&game.property_owners, space_index))
        } else {
            (false, 0)
        }
    }

    public fun get_property_level(game: &Game, space_index: u8): u8 {
        if (table::contains(&game.property_levels, space_index)) {
            *table::borrow(&game.property_levels, space_index)
        } else {
            0
        }
    }

    public fun get_board(game: &Game): &Board {
        &game.board
    }
}
