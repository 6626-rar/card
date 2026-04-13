// 主游戏逻辑

import GameState from './gameState.js';
import UIManager from './uiManager.js';
import ParticleSystem from './particleSystem.js';
import MapManager from './mapManager.js';
import MapUI from './mapUI.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.uiManager = new UIManager();
        this.particleSystem = new ParticleSystem();
        this.mapManager = new MapManager();
        this.mapUI = new MapUI();
        
        this.bindEventListeners();
        this.initGame();
    }

    // 初始化游戏
    initGame() {
        // 初始化卡牌
        this.gameState.state.deck = [...this.gameState.state.cards];
        this.gameState.shuffleDeck();
        
        // 强制显示地图容器
        const mapContainer = document.getElementById('map-container');
        if (mapContainer) {
            mapContainer.style.display = 'block';
            mapContainer.classList.remove('hidden');
        }
        
        // 初始化地图UI
        this.mapUI.init('map-container', (nodeId) => this.handlePathSelect(nodeId));
        
        // 渲染地图树形图
        this.mapUI.render(
            this.mapManager.getMapData(),
            this.mapManager.getCurrentPath(),
            this.mapManager.getUnlockedNodes()
        );
        
        // 显示选路界面，让玩家选择第一关
        this.showPathSelection();
    }

    // 绑定事件监听器
    bindEventListeners() {
        this.uiManager.bindEventListeners({
            onRest: () => this.handleRest(),
            onEndTurn: () => this.handleEndTurn(),
            onNextLevel: () => this.handleNextLevel(),
            onRestart: () => this.handleRestart(),
            onContinue: () => this.handleContinue()
        });
    }

    // 处理休息
    handleRest() {
        this.gameState.rest();
        this.updateUI();
    }

    // 处理结束回合
    handleEndTurn() {
        const state = this.gameState.getState();
        
        if (state.currentEnemy && state.currentEnemy.hp > 0) {
            // 将所有手牌加入弃牌堆
            state.discard.push(...state.hand);
            state.hand = [];
            
            // 敌人攻击
            setTimeout(() => {
                this.enemyAttack();
            }, 500);
        }
    }

    // 处理下一关
    handleNextLevel() {
        // 从地图获取当前节点的敌人
        const currentNode = this.mapManager.getCurrentNode();
        this.gameState.startLevel(currentNode.enemy);
        this.updateUI();
    }

    // 处理重新开始
    handleRestart() {
        this.gameState.reset();
        this.uiManager.hideGameOver();
        this.uiManager.hideLevelUp();
        this.initGame();
    }

    // 处理继续
    handleContinue() {
        this.uiManager.hideLevelUp();
        // 从地图获取当前节点的敌人
        const currentNode = this.mapManager.getCurrentNode();
        this.gameState.startLevel(currentNode.enemy);
        this.updateUI();
    }

    // 处理卡牌点击
    handleCardClick(cardIndex, cardElement, card) {
        const state = this.gameState.getState();
        
        // 检查精力是否足够
        if (state.energy < card.cost) {
            alert('精力不足！');
            return;
        }
        
        // 创建粒子效果
        const rect = cardElement.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;
        
        const enemyPanel = this.uiManager.getElement('enemyName').parentElement;
        const enemyRect = enemyPanel.getBoundingClientRect();
        const enemyCenterX = enemyRect.left + enemyRect.width / 2;
        const enemyCenterY = enemyRect.top + enemyRect.height / 2;
        
        this.particleSystem.createParticles(cardCenterX, cardCenterY, enemyCenterX, enemyCenterY, card.type);
        
        // 延迟应用卡牌效果
        setTimeout(() => {
            // 应用卡牌效果
            const message = this.gameState.applyCardEffects(card);
            
            // 从手牌中移除卡牌
            state.hand.splice(cardIndex, 1);
            
            // 检查敌人是否被击败
            if (state.currentEnemy.hp <= 0) {
                setTimeout(() => {
                    this.handleEnemyDefeated();
                }, 1000);
            }
            
            // 更新UI
            this.uiManager.showEnemyAction(message);
            this.updateUI();
        }, 300);
    }

    // 处理敌人攻击
    enemyAttack() {
        // 显示敌人攻击动画
        this.uiManager.showEnemyAttackAnimation();
        
        // 获取敌人和玩家位置
        const enemyPanel = this.uiManager.getElement('enemyName').parentElement;
        const enemyRect = enemyPanel.getBoundingClientRect();
        const enemyCenterX = enemyRect.left + enemyRect.width / 2;
        const enemyCenterY = enemyRect.top + enemyRect.height / 2;
        
        const hpCard = this.uiManager.getElement('hpValue').parentElement;
        const hpRect = hpCard.getBoundingClientRect();
        const hpCenterX = hpRect.left + hpRect.width / 2;
        const hpCenterY = hpRect.top + hpRect.height / 2;
        
        // 创建敌人攻击粒子效果
        this.particleSystem.createEnemyAttackParticles(enemyCenterX, enemyCenterY, hpCenterX, hpCenterY);
        
        // 屏幕震动效果
        const damage = this.gameState.state.currentEnemy.attack;
        const shakeIntensity = Math.min(damage * 2, 20);
        this.particleSystem.shakeScreen(shakeIntensity, 400);
        
        // 延迟应用伤害，让粒子先飞一会儿
        setTimeout(() => {
            // 应用敌人攻击
            const damage = this.gameState.enemyAttack();
            
            // 显示敌人动作
            const message = `${this.gameState.state.currentEnemy.name}对你造成了${damage}点伤害！`;
            this.uiManager.showEnemyAction(message);
            
            // 显示HP伤害效果
            this.uiManager.showHpDamageEffect();
            
            // 检查游戏是否结束
            const gameOverMessage = this.gameState.isGameOver();
            if (gameOverMessage) {
                this.uiManager.showGameOver(gameOverMessage);
            }
            
            // 更新UI
            this.updateUI();
        }, 300);
    }

    // 处理敌人被击败
    handleEnemyDefeated() {
        const rewardText = this.gameState.handleEnemyDefeated();
        this.uiManager.showLevelUp(rewardText);
        
        // 检查游戏是否结束
        const gameOverMessage = this.gameState.isGameOver();
        if (gameOverMessage) {
            setTimeout(() => {
                this.uiManager.showGameOver(gameOverMessage);
            }, 1000);
        } else {
            // 显示选路界面
            setTimeout(() => {
                this.showPathSelection();
            }, 1500);
        }
    }

    // 触发随机事件
    triggerEvent() {
        const state = this.gameState.getState();
        const randomEvent = state.events[Math.floor(Math.random() * state.events.length)];
        
        this.uiManager.showEvent(randomEvent, (effects) => {
            this.gameState.applyEventEffects(effects);
            this.updateUI();
        });
    }

    // 显示选路界面
    showPathSelection() {
        const nextNodes = this.mapManager.getNextNodes();
        if (nextNodes.length > 0) {
            // 强制显示地图容器
            const mapContainer = document.getElementById('map-container');
            if (mapContainer) {
                mapContainer.style.display = 'block';
                mapContainer.classList.remove('hidden');
            }
            
            // 确保地图UI初始化
            if (!this.mapUI.mapContainer) {
                this.mapUI.init('map-container', (nodeId) => this.handlePathSelect(nodeId));
            }
            
            // 渲染地图树形图
            this.mapUI.render(
                this.mapManager.getMapData(),
                this.mapManager.getCurrentPath(),
                this.mapManager.getUnlockedNodes()
            );
            
            // 显示选路面板
            this.mapUI.showPathSelection(nextNodes, (nodeId) => {
                this.handlePathSelect(nodeId);
            });
        }
    }

    // 处理路径选择
    handlePathSelect(nodeId) {
        if (this.mapManager.selectPath(nodeId)) {
            // 检查是否有事件
            const currentNode = this.mapManager.getCurrentNode();
            if (currentNode.event) {
                this.uiManager.showEvent(currentNode.event, (effects) => {
                    this.gameState.applyEventEffects(effects);
                    this.startNextLevel();
                });
            } else {
                this.startNextLevel();
            }
        }
    }

    // 开始下一关
    startNextLevel() {
        // 从地图获取当前节点的敌人
        const currentNode = this.mapManager.getCurrentNode();
        this.gameState.startLevel(currentNode.enemy);
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        const state = this.gameState.getState();
        this.uiManager.updateStats(state);
        this.uiManager.updateCards(state.hand, (index, cardElement, card) => {
            this.handleCardClick(index, cardElement, card);
        });
        this.uiManager.updateEnemy(state.currentEnemy, state.enemies, state.level);
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保DOM完全加载
    setTimeout(() => {
        new Game();
    }, 100);
});