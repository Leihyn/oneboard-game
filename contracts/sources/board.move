module oneopoly::board {
    // === Constants: Space Types ===
    const SPACE_PROPERTY: u8 = 0;
    const SPACE_CHANCE: u8 = 1;
    const SPACE_TAX: u8 = 2;
    const SPACE_START: u8 = 3;
    const SPACE_JAIL: u8 = 4;
    const SPACE_AIRDROP: u8 = 5;
    const SPACE_RUG_PULL: u8 = 6;
    const SPACE_GOVERNANCE: u8 = 7;

    // === Constants: Property Categories ===
    const CAT_YIELD_FARM: u8 = 0;
    const CAT_LP: u8 = 1;
    const CAT_DEX: u8 = 2;
    const CAT_LENDING: u8 = 3;
    const CAT_STAKING: u8 = 4;
    const CAT_NONE: u8 = 255;

    // === Constants: Board Size ===
    const BOARD_SIZE: u8 = 16;
    const MAX_UPGRADE_LEVEL: u8 = 2;

    // === Errors ===
    const EInvalidSpaceIndex: u64 = 0;

    // === Structs ===

    public struct Space has store, copy, drop {
        index: u8,
        space_type: u8,
        name: vector<u8>,
        category: u8,
        base_price: u64,
        base_rent: u64,
        upgrade_price_1: u64,
        upgrade_price_2: u64,
        rent_mult_1: u64,  // basis points (10000 = 1x)
        rent_mult_2: u64,
    }

    public struct Board has store, copy, drop {
        spaces: vector<Space>,
    }

    // === Public Functions ===

    public fun create_board(): Board {
        let mut spaces = vector::empty<Space>();

        // 0: Genesis Block (Start)
        vector::push_back(&mut spaces, Space {
            index: 0, space_type: SPACE_START, name: b"Genesis Block",
            category: CAT_NONE, base_price: 0, base_rent: 0,
            upgrade_price_1: 0, upgrade_price_2: 0, rent_mult_1: 0, rent_mult_2: 0,
        });

        // 1: OnePlay (Yield Farm)
        vector::push_back(&mut spaces, Space {
            index: 1, space_type: SPACE_PROPERTY, name: b"OnePlay",
            category: CAT_YIELD_FARM, base_price: 600, base_rent: 60,
            upgrade_price_1: 300, upgrade_price_2: 600, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 2: OCT Airdrop (Airdrop)
        vector::push_back(&mut spaces, Space {
            index: 2, space_type: SPACE_AIRDROP, name: b"OCT Airdrop",
            category: CAT_NONE, base_price: 0, base_rent: 0,
            upgrade_price_1: 0, upgrade_price_2: 0, rent_mult_1: 0, rent_mult_2: 0,
        });

        // 3: OneRWA (Lending)
        vector::push_back(&mut spaces, Space {
            index: 3, space_type: SPACE_PROPERTY, name: b"OneRWA",
            category: CAT_LENDING, base_price: 800, base_rent: 80,
            upgrade_price_1: 400, upgrade_price_2: 800, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 4: OneDEX (DEX)
        vector::push_back(&mut spaces, Space {
            index: 4, space_type: SPACE_PROPERTY, name: b"OneDEX",
            category: CAT_DEX, base_price: 1000, base_rent: 100,
            upgrade_price_1: 500, upgrade_price_2: 1000, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 5: Gas Tax (Tax)
        vector::push_back(&mut spaces, Space {
            index: 5, space_type: SPACE_TAX, name: b"Gas Tax",
            category: CAT_NONE, base_price: 0, base_rent: 200,
            upgrade_price_1: 0, upgrade_price_2: 0, rent_mult_1: 0, rent_mult_2: 0,
        });

        // 6: OCT Staking (Staking)
        vector::push_back(&mut spaces, Space {
            index: 6, space_type: SPACE_PROPERTY, name: b"OCT Staking",
            category: CAT_STAKING, base_price: 900, base_rent: 90,
            upgrade_price_1: 450, upgrade_price_2: 900, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 7: OneDEX LP (LP)
        vector::push_back(&mut spaces, Space {
            index: 7, space_type: SPACE_PROPERTY, name: b"OneDEX LP",
            category: CAT_LP, base_price: 700, base_rent: 70,
            upgrade_price_1: 350, upgrade_price_2: 700, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 8: MEV Jail (Jail)
        vector::push_back(&mut spaces, Space {
            index: 8, space_type: SPACE_JAIL, name: b"MEV Jail",
            category: CAT_NONE, base_price: 0, base_rent: 0,
            upgrade_price_1: 0, upgrade_price_2: 0, rent_mult_1: 0, rent_mult_2: 0,
        });

        // 9: USDO Vault (Lending)
        vector::push_back(&mut spaces, Space {
            index: 9, space_type: SPACE_PROPERTY, name: b"USDO Vault",
            category: CAT_LENDING, base_price: 1100, base_rent: 110,
            upgrade_price_1: 550, upgrade_price_2: 1100, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 10: Rug Pull
        vector::push_back(&mut spaces, Space {
            index: 10, space_type: SPACE_RUG_PULL, name: b"Rug Pull",
            category: CAT_NONE, base_price: 0, base_rent: 0,
            upgrade_price_1: 0, upgrade_price_2: 0, rent_mult_1: 0, rent_mult_2: 0,
        });

        // 11: OneTransfer (LP)
        vector::push_back(&mut spaces, Space {
            index: 11, space_type: SPACE_PROPERTY, name: b"OneTransfer",
            category: CAT_LP, base_price: 850, base_rent: 85,
            upgrade_price_1: 425, upgrade_price_2: 850, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 12: OnePredict (Staking) - highest value property
        vector::push_back(&mut spaces, Space {
            index: 12, space_type: SPACE_PROPERTY, name: b"OnePredict",
            category: CAT_STAKING, base_price: 1200, base_rent: 120,
            upgrade_price_1: 600, upgrade_price_2: 1200, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 13: DAO Vote (Governance)
        vector::push_back(&mut spaces, Space {
            index: 13, space_type: SPACE_GOVERNANCE, name: b"DAO Vote",
            category: CAT_NONE, base_price: 0, base_rent: 0,
            upgrade_price_1: 0, upgrade_price_2: 0, rent_mult_1: 0, rent_mult_2: 0,
        });

        // 14: OnePoker (DEX)
        vector::push_back(&mut spaces, Space {
            index: 14, space_type: SPACE_PROPERTY, name: b"OnePoker",
            category: CAT_DEX, base_price: 750, base_rent: 75,
            upgrade_price_1: 375, upgrade_price_2: 750, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        // 15: OneNFT (Yield Farm)
        vector::push_back(&mut spaces, Space {
            index: 15, space_type: SPACE_PROPERTY, name: b"OneNFT",
            category: CAT_YIELD_FARM, base_price: 650, base_rent: 65,
            upgrade_price_1: 325, upgrade_price_2: 650, rent_mult_1: 25000, rent_mult_2: 60000,
        });

        Board { spaces }
    }

    // === Accessor Functions ===

    public fun board_size(): u8 { BOARD_SIZE }

    public fun get_space(board: &Board, index: u8): &Space {
        assert!((index as u64) < vector::length(&board.spaces), EInvalidSpaceIndex);
        vector::borrow(&board.spaces, (index as u64))
    }

    public fun space_type(space: &Space): u8 { space.space_type }
    public fun space_name(space: &Space): vector<u8> { space.name }
    public fun space_category(space: &Space): u8 { space.category }
    public fun space_base_price(space: &Space): u64 { space.base_price }
    public fun space_base_rent(space: &Space): u64 { space.base_rent }

    public fun is_property(space: &Space): bool { space.space_type == SPACE_PROPERTY }
    public fun is_chance(space: &Space): bool { space.space_type == SPACE_CHANCE }
    public fun is_tax(space: &Space): bool { space.space_type == SPACE_TAX }
    public fun is_start(space: &Space): bool { space.space_type == SPACE_START }
    public fun is_jail(space: &Space): bool { space.space_type == SPACE_JAIL }
    public fun is_airdrop(space: &Space): bool { space.space_type == SPACE_AIRDROP }
    public fun is_rug_pull(space: &Space): bool { space.space_type == SPACE_RUG_PULL }
    public fun is_governance(space: &Space): bool { space.space_type == SPACE_GOVERNANCE }

    public fun calculate_rent(space: &Space, level: u8): u64 {
        if (level == 0) {
            space.base_rent
        } else if (level == 1) {
            space.base_rent * space.rent_mult_1 / 10000
        } else {
            space.base_rent * space.rent_mult_2 / 10000
        }
    }

    public fun upgrade_cost(space: &Space, current_level: u8): u64 {
        if (current_level == 0) {
            space.upgrade_price_1
        } else if (current_level == 1) {
            space.upgrade_price_2
        } else {
            0 // already max
        }
    }

    public fun max_upgrade_level(): u8 { MAX_UPGRADE_LEVEL }

    // === Space Type Constants (public) ===
    public fun space_type_property(): u8 { SPACE_PROPERTY }
    public fun space_type_chance(): u8 { SPACE_CHANCE }
    public fun space_type_tax(): u8 { SPACE_TAX }
    public fun space_type_start(): u8 { SPACE_START }
    public fun space_type_jail(): u8 { SPACE_JAIL }
    public fun space_type_airdrop(): u8 { SPACE_AIRDROP }
    public fun space_type_rug_pull(): u8 { SPACE_RUG_PULL }
    public fun space_type_governance(): u8 { SPACE_GOVERNANCE }
}
