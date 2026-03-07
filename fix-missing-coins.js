// fix-missing-coins.js
// Script pour créditer les utilisateurs qui ont payé mais n'ont pas reçu leurs coins

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    'https://qfhztozowlqajvkqdsvl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaHp0b3pvd2xxYWp2a3Fkc3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYzMTY3OSwiZXhwIjoyMDg4MjA3Njc5fQ.GG1lh8JOoX70vomo6futGOc7d1edGLtR4wVaeVtph5Y'
);

const COIN_PACKS = {
    'small': { coins: 100, bonus: 0 },
    'medium': { coins: 300, bonus: 20 },
    'large': { coins: 700, bonus: 50 },
    'xlarge': { coins: 2000, bonus: 200 }
};

async function fixMissingCoins() {
    console.log('🔍 Recherche des transactions réussies sans crédit...');

    // Trouver toutes les transactions coins_purchase réussies
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, profiles!inner(id, username, email, coins)')
        .eq('type', 'coins_purchase')
        .eq('status', 'successful')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('❌ Erreur:', error);
        return;
    }

    console.log(`📊 ${transactions.length} transactions trouvées`);

    let fixed = 0;
    let skipped = 0;

    for (const tx of transactions) {
        // Vérifier si déjà crédité
        const { data: existingActivity } = await supabase
            .from('user_activities')
            .select('id')
            .eq('user_id', tx.user_id)
            .eq('activity_type', 'coins_purchase')
            .filter('metadata->>transaction_id', 'eq', tx.id)
            .maybeSingle();

        if (existingActivity) {
            console.log(`⏭️ Transaction ${tx.id} déjà créditée`);
            skipped++;
            continue;
        }

        // Calculer les coins à créditer
        let coinsToAdd = tx.coins_amount || 0;
        
        if (coinsToAdd === 0 && tx.pack_id && COIN_PACKS[tx.pack_id]) {
            const pack = COIN_PACKS[tx.pack_id];
            coinsToAdd = pack.coins + (pack.bonus || 0);
        }

        if (coinsToAdd === 0 && tx.metadata?.pack) {
            const pack = tx.metadata.pack;
            coinsToAdd = (pack.coins || 0) + (pack.bonus || 0);
        }

        if (coinsToAdd === 0) {
            console.log(`⚠️ Impossible de déterminer les coins pour tx ${tx.id}`);
            continue;
        }

        // Créditer l'utilisateur
        const newBalance = (tx.profiles?.coins || 0) + coinsToAdd;
        
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ coins: newBalance })
            .eq('id', tx.user_id);

        if (updateError) {
            console.error(`❌ Erreur crédit pour tx ${tx.id}:`, updateError);
            continue;
        }

        // Journaliser
        await supabase
            .from('user_activities')
            .insert([{
                user_id: tx.user_id,
                activity_type: 'coins_purchase',
                coins_earned: coinsToAdd,
                description: `Achat de ${coinsToAdd} coins (transaction ${tx.id}) - RATTRAPAGE`,
                metadata: { 
                    transaction_id: tx.id,
                    fapshi_id: tx.fapshi_transaction_id,
                    pack_id: tx.pack_id
                }
            }]);

        console.log(`✅ ${coinsToAdd} coins crédités à ${tx.profiles?.username} (tx: ${tx.id})`);
        fixed++;
    }

    console.log('\n========== RÉSUMÉ ==========');
    console.log(`✅ Transactions traitées: ${fixed}`);
    console.log(`⏭️ Déjà créditées: ${skipped}`);
    console.log(`📊 Total: ${transactions.length}`);
}

fixMissingCoins().catch(console.error);
