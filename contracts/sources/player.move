module oneopoly::player {
    // === Constants: AI Personalities ===
    const AI_DEGEN: u8 = 0;
    const AI_WHALE: u8 = 1;
    const AI_MEV_BOT: u8 = 2;

    // === Constants: Starting Balance ===
    const STARTING_BALANCE: u64 = 5000;
    const START_PASS_BONUS: u64 = 500;

    // === Errors ===
    const EPlayerBankrupt: u64 = 100;
    const EInsufficientBalance: u64 = 101;

    // === Structs ===

    public struct PlayerState has store, drop, copy {
        addr: address,
        balance: u64,
        position: u8,
        is_bankrupt: bool,
        is_ai: bool,
        ai_personality: u8,
        jail_turns: u8,
        properties_owned: vector<u8>,
    }

    // === Constructor ===

    public fun new_human(addr: address): PlayerState {
        PlayerState {
            addr,
            balance: STARTING_BALANCE,
            position: 0,
            is_bankrupt: false,
            is_ai: false,
            ai_personality: 255,
            jail_turns: 0,
            properties_owned: vector::empty(),
        }
    }

    public fun new_ai(addr: address, personality: u8): PlayerState {
        PlayerState {
            addr,
            balance: STARTING_BALANCE,
            position: 0,
            is_bankrupt: false,
            is_ai: true,
            ai_personality: personality,
            jail_turns: 0,
            properties_owned: vector::empty(),
        }
    }

    // === Accessors ===

    public fun addr(p: &PlayerState): address { p.addr }
    public fun balance(p: &PlayerState): u64 { p.balance }
    public fun position(p: &PlayerState): u8 { p.position }
    public fun is_bankrupt(p: &PlayerState): bool { p.is_bankrupt }
    public fun is_ai(p: &PlayerState): bool { p.is_ai }
    public fun ai_personality(p: &PlayerState): u8 { p.ai_personality }
    public fun jail_turns(p: &PlayerState): u8 { p.jail_turns }
    public fun properties_owned(p: &PlayerState): &vector<u8> { &p.properties_owned }

    // === Mutators ===

    public(package) fun set_position(p: &mut PlayerState, pos: u8) {
        p.position = pos;
    }

    public(package) fun add_balance(p: &mut PlayerState, amount: u64) {
        p.balance = p.balance + amount;
    }

    public(package) fun deduct_balance(p: &mut PlayerState, amount: u64) {
        if (amount >= p.balance) {
            p.balance = 0;
            p.is_bankrupt = true;
        } else {
            p.balance = p.balance - amount;
        };
    }

    public(package) fun add_property(p: &mut PlayerState, space_index: u8) {
        vector::push_back(&mut p.properties_owned, space_index);
    }

    public(package) fun set_jail(p: &mut PlayerState, turns: u8) {
        p.jail_turns = turns;
    }

    public(package) fun decrement_jail(p: &mut PlayerState) {
        if (p.jail_turns > 0) {
            p.jail_turns = p.jail_turns - 1;
        };
    }

    public(package) fun mark_bankrupt(p: &mut PlayerState) {
        p.is_bankrupt = true;
    }

    // === Helpers ===

    public fun can_afford(p: &PlayerState, amount: u64): bool {
        p.balance >= amount
    }

    public fun is_in_jail(p: &PlayerState): bool {
        p.jail_turns > 0
    }

    public fun starting_balance(): u64 { STARTING_BALANCE }
    public fun start_pass_bonus(): u64 { START_PASS_BONUS }
    public fun ai_degen(): u8 { AI_DEGEN }
    public fun ai_whale(): u8 { AI_WHALE }
    public fun ai_mev_bot(): u8 { AI_MEV_BOT }
}
