// UI管理

class UIManager {
    constructor() {
        this.elements = {
            knValue: document.getElementById('kn-value'),
            knBar: document.getElementById('kn-bar'),
            focusValue: document.getElementById('focus-value'),
            focusBar: document.getElementById('focus-bar'),
            energyValue: document.getElementById('energy-value'),
            energyBar: document.getElementById('energy-bar'),
            hpValue: document.getElementById('hp-value'),
            hpBar: document.getElementById('hp-bar'),
            cardsContainer: document.getElementById('cards-container'),
            enemyName: document.getElementById('enemy-name'),
            enemyHp: document.getElementById('enemy-hp'),
            enemyHpBar: document.getElementById('enemy-hp-bar'),
            enemyAction: document.getElementById('enemy-action'),
            eventPanel: document.getElementById('event-panel'),
            eventText: document.getElementById('event-text'),
            eventOptions: document.getElementById('event-options'),
            restBtn: document.getElementById('rest-btn'),
            endTurnBtn: document.getElementById('end-turn-btn'),
            nextLevelBtn: document.getElementById('next-level-btn'),
            gameOverModal: document.getElementById('game-over-modal'),
            gameOverText: document.getElementById('game-over-text'),
            restartBtn: document.getElementById('restart-btn'),
            levelUpModal: document.getElementById('level-up-modal'),
            levelUpText: document.getElementById('level-up-text'),
            continueBtn: document.getElementById('continue-btn'),
            playerHpDisplay: document.getElementById('player-hp-display'),
            playerFocusDisplay: document.getElementById('player-focus-display'),
            playerAvatar: document.getElementById('player-avatar'),
            playerPanel: document.querySelector('.player-panel')
        };
    }

    // 更新状态显示
    updateStats(state) {
        this.elements.knValue.textContent = state.kn;
        this.elements.knBar.style.width = `${Math.min(100, state.kn)}%`;
        
        this.elements.focusValue.textContent = state.focus;
        this.elements.focusBar.style.width = `${Math.min(100, state.focus * 10)}%`;
        
        this.elements.energyValue.textContent = `${state.energy}/${state.maxEnergy}`;
        this.elements.energyBar.style.width = `${(state.energy / state.maxEnergy) * 100}%`;
        
        this.elements.hpValue.textContent = `${state.hp}/${state.maxHp}`;
        this.elements.hpBar.style.width = `${(state.hp / state.maxHp) * 100}%`;
        
        this.elements.playerHpDisplay.textContent = `${state.hp}/${state.maxHp}`;
        this.elements.playerFocusDisplay.textContent = state.focus;
    }

    // 更新卡牌显示
    updateCards(hand, onCardClick) {
        this.elements.cardsContainer.innerHTML = '';
        
        hand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.innerHTML = `
                <div class="card-title">${card.name}</div>
                <div class="card-effect">
                    ${Object.entries(card.effects).map(([key, value]) => {
                        const effectNames = {
                            attack: '攻击',
                            hp: '回血',
                            kn: '困意',
                            focus: '专注',
                            energy: '精力'
                        };
                        return `${effectNames[key]}: ${value > 0 ? '+' : ''}${value}`;
                    }).join('<br>')}
                </div>
                <div class="card-cost">消耗: ${card.cost} | 双击使用</div>
            `;
            
            let lastClickTime = 0;
            cardElement.addEventListener('click', (e) => {
                const currentTime = new Date().getTime();
                const timeSinceLastClick = currentTime - lastClickTime;
                
                if (timeSinceLastClick < 300) {
                    onCardClick(index, cardElement, card);
                }
                
                lastClickTime = currentTime;
            });
            
            this.elements.cardsContainer.appendChild(cardElement);
        });
    }

    // 更新敌人显示
    updateEnemy(currentEnemy, enemies, level) {
        if (currentEnemy) {
            this.elements.enemyName.textContent = currentEnemy.name;
            this.elements.enemyHp.textContent = `HP: ${currentEnemy.hp}`;
            this.elements.enemyHpBar.style.width = `${(currentEnemy.hp / enemies[level - 1].hp) * 100}%`;
        }
    }

    // 显示敌人动作
    showEnemyAction(message) {
        this.elements.enemyAction.textContent = message;
    }

    // 显示事件面板
    showEvent(event, onOptionSelect) {
        this.elements.eventText.textContent = event.text;
        this.elements.eventOptions.innerHTML = '';
        
        event.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                onOptionSelect(option.effects);
                this.hideEvent();
            });
            this.elements.eventOptions.appendChild(button);
        });
        
        this.elements.eventPanel.classList.remove('hidden');
    }

    // 隐藏事件面板
    hideEvent() {
        this.elements.eventPanel.classList.add('hidden');
    }

    // 显示游戏结束模态框
    showGameOver(text) {
        this.elements.gameOverText.textContent = text;
        this.elements.gameOverModal.classList.remove('hidden');
    }

    // 隐藏游戏结束模态框
    hideGameOver() {
        this.elements.gameOverModal.classList.add('hidden');
    }

    // 显示关卡完成模态框
    showLevelUp(text) {
        this.elements.levelUpText.textContent = text;
        this.elements.levelUpModal.classList.remove('hidden');
    }

    // 隐藏关卡完成模态框
    hideLevelUp() {
        this.elements.levelUpModal.classList.add('hidden');
    }

    // 显示敌人攻击动画
    showEnemyAttackAnimation() {
        const enemyPanel = this.elements.enemyName.parentElement;
        enemyPanel.classList.add('enemy-attacking');
        setTimeout(() => {
            enemyPanel.classList.remove('enemy-attacking');
        }, 500);
    }

    // 显示HP伤害效果
    showHpDamageEffect() {
        // HP条闪烁效果
        this.elements.hpBar.classList.add('hp-damage-flash');
        setTimeout(() => {
            this.elements.hpBar.classList.remove('hp-damage-flash');
        }, 400);
        
        // HP卡片震动效果
        const hpCard = this.elements.hpValue.parentElement;
        hpCard.classList.add('stat-card-damage');
        setTimeout(() => {
            hpCard.classList.remove('stat-card-damage');
        }, 400);
        
        // 玩家角色面板震动效果
        this.elements.playerPanel.classList.add('stat-card-damage');
        setTimeout(() => {
            this.elements.playerPanel.classList.remove('stat-card-damage');
        }, 400);
    }

    // 绑定事件监听器
    bindEventListeners(handlers) {
        this.elements.restBtn.addEventListener('click', handlers.onRest);
        this.elements.endTurnBtn.addEventListener('click', handlers.onEndTurn);
        this.elements.nextLevelBtn.addEventListener('click', handlers.onNextLevel);
        this.elements.restartBtn.addEventListener('click', handlers.onRestart);
        this.elements.continueBtn.addEventListener('click', handlers.onContinue);
    }

    // 获取元素
    getElement(key) {
        return this.elements[key];
    }
}

export default UIManager;