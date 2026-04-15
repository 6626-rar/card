// 地图UI模块

class MapUI {
    constructor() {
        this.mapContainer = null;
        this.canvas = null;
        this.ctx = null;
        this.onPathSelect = null;
    }

    // 初始化地图UI
    init(containerId, onPathSelect) {
        this.mapContainer = document.getElementById(containerId);
        this.onPathSelect = onPathSelect;

        // 创建画布
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600;
        this.canvas.height = 400;
        this.canvas.className = 'map-canvas';
        this.mapContainer.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
    }

    // 绘制边
    drawEdges(edges, nodes, unlockedNodes) {
        edges.forEach(edge => {
            const fromNode = nodes.find(node => node.id === edge.from);
            const toNode = nodes.find(node => node.id === edge.to);

            if (fromNode && toNode) {
                // 检查是否已解锁
                const isUnlocked = unlockedNodes.has(edge.from) && unlockedNodes.has(edge.to);

                // 绘制边
                this.ctx.beginPath();
                this.ctx.moveTo(fromNode.x, fromNode.y);
                this.ctx.lineTo(toNode.x, toNode.y);
                
                if (isUnlocked) {
                    // 已解锁的边：渐变色
                    const gradient = this.ctx.createLinearGradient(fromNode.x, fromNode.y, toNode.x, toNode.y);
                    gradient.addColorStop(0, '#4CAF50');
                    gradient.addColorStop(1, '#81C784');
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 3;
                    
                    // 添加发光效果
                    this.ctx.shadowColor = '#4CAF50';
                    this.ctx.shadowBlur = 5;
                } else {
                    // 未解锁的边：灰色
                    this.ctx.strokeStyle = '#E0E0E0';
                    this.ctx.lineWidth = 2;
                    this.ctx.setLineDash([5, 5]); // 虚线
                    this.ctx.shadowBlur = 0;
                }
                
                this.ctx.stroke();
                this.ctx.setLineDash([]); // 重置为实线
            }
        });
    }
    
    // 渲染地图
    render(mapData, currentPath, unlockedNodes) {
        if (!this.ctx) return;

        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#F5F5F5';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格背景
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.canvas.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        // 绘制边
        this.drawEdges(mapData.edges, mapData.nodes, unlockedNodes);

        // 绘制节点
        this.drawNodes(mapData.nodes, currentPath, unlockedNodes);
    }

    // 绘制节点
    drawNodes(nodes, currentPath, unlockedNodes) {
        nodes.forEach(node => {
            const isCurrent = currentPath[currentPath.length - 1] === node.id;
            const isUnlocked = unlockedNodes.has(node.id);

            // 绘制节点圆圈
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, isCurrent ? 18 : 12, 0, Math.PI * 2);
            
            if (isCurrent) {
                // 当前节点：橙色渐变
                const gradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 18);
                gradient.addColorStop(0, '#FFB74D');
                gradient.addColorStop(1, '#FF9800');
                this.ctx.fillStyle = gradient;
            } else if (isUnlocked) {
                switch (node.type) {
                    case 'boss':
                        // BOSS节点：红色渐变
                        const bossGradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
                        bossGradient.addColorStop(0, '#EF5350');
                        bossGradient.addColorStop(1, '#F44336');
                        this.ctx.fillStyle = bossGradient;
                        break;
                    case 'rest':
                        // 休息节点：蓝色渐变
                        const restGradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
                        restGradient.addColorStop(0, '#64B5F6');
                        restGradient.addColorStop(1, '#2196F3');
                        this.ctx.fillStyle = restGradient;
                        break;
                    default:
                        // 普通节点：绿色渐变
                        const normalGradient = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 12);
                        normalGradient.addColorStop(0, '#81C784');
                        normalGradient.addColorStop(1, '#4CAF50');
                        this.ctx.fillStyle = normalGradient;
                }
            } else {
                // 未解锁节点：灰色
                this.ctx.fillStyle = '#BDBDBD';
            }
            
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // 绘制节点文本
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.enemy.name, node.x, node.y);

            // 绘制事件图标
            if (node.event && isUnlocked) {
                // 事件图标：黄色星星
                this.ctx.fillStyle = '#FFEB3B';
                this.ctx.beginPath();
                this.ctx.moveTo(node.x + 20, node.y - 20);
                this.ctx.lineTo(node.x + 22, node.y - 16);
                this.ctx.lineTo(node.x + 26, node.y - 16);
                this.ctx.lineTo(node.x + 23, node.y - 13);
                this.ctx.lineTo(node.x + 24, node.y - 9);
                this.ctx.lineTo(node.x + 20, node.y - 11);
                this.ctx.lineTo(node.x + 16, node.y - 9);
                this.ctx.lineTo(node.x + 17, node.y - 13);
                this.ctx.lineTo(node.x + 14, node.y - 16);
                this.ctx.lineTo(node.x + 18, node.y - 16);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    // 处理点击事件
    handleClick(x, y, mapData, currentPath, unlockedNodes) {
        const currentNodeId = currentPath[currentPath.length - 1];
        const nextNodeIds = mapData.edges
            .filter(edge => edge.from === currentNodeId)
            .map(edge => edge.to);

        // 检查是否点击了可选节点
        for (const nodeId of nextNodeIds) {
            const node = mapData.nodes.find(node => node.id === nodeId);
            if (node) {
                const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
                if (distance <= 15) {
                    if (this.onPathSelect) {
                        this.onPathSelect(nodeId);
                    }
                    return true;
                }
            }
        }

        return false;
    }

    // 显示选路界面
    showPathSelection(nextNodes, onSelect) {
        // 先移除现有的选路面板
        const existingPanel = document.querySelector('.path-selection-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // 创建选路面板
        const selectionPanel = document.createElement('div');
        selectionPanel.className = 'path-selection-panel';
        
        // 设置面板内容
        const panelContent = document.createElement('div');
        panelContent.innerHTML = `
            <h3>选择路径</h3>
            <div class="path-options"></div>
        `;
        selectionPanel.appendChild(panelContent);

        const optionsContainer = panelContent.querySelector('.path-options');

        nextNodes.forEach(node => {
            const option = document.createElement('div');
            option.className = 'path-option';
            
            const optionContent = document.createElement('div');
            optionContent.innerHTML = `
                <div class="path-info">
                    <h4>${node.enemy.name}</h4>
                    <p>类型: ${this.getNodeTypeName(node.type)}</p>
                    ${node.event ? `<p>事件: ${node.event.name}</p>` : ''}
                    <p>HP: ${node.enemy.hp}</p>
                    <p>攻击: ${node.enemy.attack}</p>
                </div>
                <button class="btn btn-primary select-path-btn">选择</button>
            `;
            option.appendChild(optionContent);

            // 确保按钮元素存在后再添加事件监听器
            const selectBtn = optionContent.querySelector('.select-path-btn');
            if (selectBtn) {
                selectBtn.addEventListener('click', () => {
                    onSelect(node.id);
                    // 延迟移除面板，确保事件处理完成
                    setTimeout(() => {
                        if (selectionPanel.parentNode) {
                            selectionPanel.parentNode.removeChild(selectionPanel);
                        }
                    }, 100);
                });
            }

            optionsContainer.appendChild(option);
        });

        // 添加到页面
        document.body.appendChild(selectionPanel);
        
        // 确保面板可见
        selectionPanel.style.display = 'flex';
    }

    // 获取节点类型名称
    getNodeTypeName(type) {
        switch (type) {
            case 'boss':
                return 'BOSS';
            case 'rest':
                return '休息';
            default:
                return '普通';
        }
    }

    // 显示地图
    show() {
        if (this.mapContainer) {
            this.mapContainer.classList.remove('hidden');
        }
    }

    // 隐藏地图
    hide() {
        if (this.mapContainer) {
            this.mapContainer.classList.add('hidden');
        }
    }
}

export default MapUI;