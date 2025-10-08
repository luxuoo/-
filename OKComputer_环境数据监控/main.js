// 全局变量
let currentData = null;
let trendChart = null;
let updateInterval = null;

// ThingSpeak API配置
const CHANNEL_ID = "3092550";
const READ_API_KEY = "1JCH60ZZR69R58JN";
const API_URL = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?api_key=${READ_API_KEY}`;

// 预警阈值设置
const ALERT_THRESHOLDS = {
    temperature: { min: 15, max: 35, warning: { min: 18, max: 30 } },
    humidity: { min: 30, max: 80, warning: { min: 40, max: 70 } },
    pressure: { min: 980, max: 1030, warning: { min: 990, max: 1020 } },
    airquality: { min: 0, max: 200, warning: { min: 0, max: 150 } }
};

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupParticleBackground();
    startDataUpdates();
});

// 初始化应用
async function initializeApp() {
    try {
        await fetchData();
        updateDashboard();
        initializeTrendChart();
        setupAnimations();
    } catch (error) {
        console.error('初始化失败:', error);
        showError('数据加载失败，请刷新页面重试');
    }
}

// 获取ThingSpeak数据
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentData = data;
        return data;
    } catch (error) {
        console.error('获取数据失败:', error);
        throw error;
    }
}

// 更新仪表板显示
function updateDashboard() {
    if (!currentData || !currentData.feeds || currentData.feeds.length === 0) {
        return;
    }

    const latestFeed = currentData.feeds[currentData.feeds.length - 1];
    
    // 更新温度
    const temp1 = parseFloat(latestFeed.field1) || 0;
    updateDataCard('temp1', temp1, '°C', getTemperatureStatus(temp1));
    
    // 更新湿度
    const humidity = parseFloat(latestFeed.field2) || 0;
    updateDataCard('humidity', humidity, '%', getHumidityStatus(humidity));
    
    // 更新气压
    const pressure = parseFloat(latestFeed.field4) || 0;
    updateDataCard('pressure', pressure, 'hPa', getPressureStatus(pressure));
    
    // 更新空气质量
    const airquality = parseFloat(latestFeed.field5) || 0;
    updateDataCard('airquality', airquality, 'AQI', getAirQualityStatus(airquality));
    
    // 更新时间戳
    if (latestFeed.created_at) {
        const updateTime = new Date(latestFeed.created_at);
        document.getElementById('last-update').textContent = updateTime.toLocaleTimeString('zh-CN');
    }
}

// 更新数据卡片
function updateDataCard(type, value, unit, status) {
    const valueElement = document.getElementById(`${type}-value`);
    const statusElement = document.getElementById(`${type}-status`);
    
    if (valueElement) {
        // 数值变化动画
        anime({
            targets: valueElement,
            innerHTML: [valueElement.innerHTML, value.toFixed(1)],
            duration: 1000,
            round: 10,
            easing: 'easeOutQuart'
        });
    }
    
    if (statusElement) {
        statusElement.textContent = status.text;
        statusElement.className = `text-sm ${status.color}`;
    }
}

// 获取温度状态
function getTemperatureStatus(temp) {
    const thresholds = ALERT_THRESHOLDS.temperature;
    if (temp < thresholds.min || temp > thresholds.max) {
        return { text: '危险', color: 'status-danger' };
    } else if (temp < thresholds.warning.min || temp > thresholds.warning.max) {
        return { text: '警告', color: 'status-warning' };
    }
    return { text: '正常', color: 'status-normal' };
}

// 获取湿度状态
function getHumidityStatus(humidity) {
    const thresholds = ALERT_THRESHOLDS.humidity;
    if (humidity < thresholds.min || humidity > thresholds.max) {
        return { text: '危险', color: 'status-danger' };
    } else if (humidity < thresholds.warning.min || humidity > thresholds.warning.max) {
        return { text: '警告', color: 'status-warning' };
    }
    return { text: '正常', color: 'status-normal' };
}

// 获取气压状态
function getPressureStatus(pressure) {
    const thresholds = ALERT_THRESHOLDS.pressure;
    if (pressure < thresholds.min || pressure > thresholds.max) {
        return { text: '危险', color: 'status-danger' };
    } else if (pressure < thresholds.warning.min || pressure > thresholds.warning.max) {
        return { text: '警告', color: 'status-warning' };
    }
    return { text: '正常', color: 'status-normal' };
}

// 获取空气质量状态
function getAirQualityStatus(aqi) {
    const thresholds = ALERT_THRESHOLDS.airquality;
    if (aqi > 200) {
        return { text: '危险', color: 'status-danger' };
    } else if (aqi > 150) {
        return { text: '警告', color: 'status-warning' };
    } else if (aqi > 100) {
        return { text: '轻度污染', color: 'status-warning' };
    }
    return { text: '良好', color: 'status-normal' };
}

// 初始化趋势图表
function initializeTrendChart() {
    const chartElement = document.getElementById('trend-chart');
    if (!chartElement) return;
    
    trendChart = echarts.init(chartElement);
    updateTrendChart();
}

// 更新趋势图表
function updateTrendChart() {
    if (!currentData || !currentData.feeds || !trendChart) return;
    
    const feeds = currentData.feeds.slice(-24); // 获取最近24条数据
    const times = feeds.map(feed => new Date(feed.created_at).toLocaleTimeString('zh-CN'));
    const temperatures = feeds.map(feed => parseFloat(feed.field1) || 0);
    const humidity = feeds.map(feed => parseFloat(feed.field2) || 0);
    const pressure = feeds.map(feed => parseFloat(feed.field4) || 0);
    const airquality = feeds.map(feed => parseFloat(feed.field5) || 0);
    
    const option = {
        title: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: ['温度 (°C)', '湿度 (%)', '气压 (hPa)', '空气质量 (AQI)'],
            top: 10
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: times,
            axisLabel: {
                rotate: 45,
                fontSize: 10
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '温度/湿度',
                position: 'left',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: '气压/AQI',
                position: 'right',
                axisLabel: {
                    formatter: '{value}'
                }
            }
        ],
        series: [
            {
                name: '温度 (°C)',
                type: 'line',
                data: temperatures,
                smooth: true,
                lineStyle: {
                    color: '#0ea5e9',
                    width: 2
                },
                itemStyle: {
                    color: '#0ea5e9'
                }
            },
            {
                name: '湿度 (%)',
                type: 'line',
                data: humidity,
                smooth: true,
                lineStyle: {
                    color: '#059669',
                    width: 2
                },
                itemStyle: {
                    color: '#059669'
                }
            },
            {
                name: '气压 (hPa)',
                type: 'line',
                yAxisIndex: 1,
                data: pressure,
                smooth: true,
                lineStyle: {
                    color: '#8b5cf6',
                    width: 2
                },
                itemStyle: {
                    color: '#8b5cf6'
                }
            },
            {
                name: '空气质量 (AQI)',
                type: 'line',
                yAxisIndex: 1,
                data: airquality,
                smooth: true,
                lineStyle: {
                    color: '#f59e0b',
                    width: 2
                },
                itemStyle: {
                    color: '#f59e0b'
                }
            }
        ],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut'
    };
    
    trendChart.setOption(option);
}

// 设置粒子背景
function setupParticleBackground() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    new p5(function(p) {
        let particles = [];
        
        p.setup = function() {
            const canvas = p.createCanvas(window.innerWidth, 128);
            canvas.parent('particles-canvas');
            
            // 创建粒子
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 4),
                    opacity: p.random(0.3, 0.8)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // 绘制连接线
            p.stroke(255, 255, 255, 30);
            p.strokeWeight(1);
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                    if (dist < 100) {
                        p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
                    }
                }
            }
            
            // 绘制和更新粒子
            p.noStroke();
            for (let particle of particles) {
                p.fill(255, 255, 255, particle.opacity * 255);
                p.circle(particle.x, particle.y, particle.size);
                
                // 更新位置
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 边界检测
                if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;
            }
        };
        
        p.windowResized = function() {
            p.resizeCanvas(window.innerWidth, 128);
        };
    });
}

// 设置动画效果
function setupAnimations() {
    // 页面加载动画
    anime({
        targets: '.data-card',
        translateY: [50, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutQuart'
    });
    
    // 卡片悬停效果
    const cards = document.querySelectorAll('.data-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card,
                scale: 1.02,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', () => {
            anime({
                targets: card,
                scale: 1,
                duration: 200,
                easing: 'easeOutQuad'
            });
        });
    });
}

// 开始数据更新
function startDataUpdates() {
    updateInterval = setInterval(async () => {
        try {
            await fetchData();
            updateDashboard();
            updateTrendChart();
        } catch (error) {
            console.error('数据更新失败:', error);
        }
    }, 30000); // 每30秒更新一次
}

// 显示详细数据模态框
function showDetailModal(dataType) {
    const modal = document.getElementById('detail-modal');
    const title = document.getElementById('modal-title');
    const content = document.getElementById('modal-content');
    
    if (!currentData || !currentData.feeds) return;
    
    const latestFeed = currentData.feeds[currentData.feeds.length - 1];
    let value, unit, status, trendData;
    
    switch (dataType) {
        case 'temperature':
            value = parseFloat(latestFeed.field1) || 0;
            unit = '°C';
            status = getTemperatureStatus(value);
            title.textContent = '温度详细数据';
            trendData = currentData.feeds.slice(-24).map(feed => parseFloat(feed.field1) || 0);
            break;
        case 'humidity':
            value = parseFloat(latestFeed.field2) || 0;
            unit = '%';
            status = getHumidityStatus(value);
            title.textContent = '湿度详细数据';
            trendData = currentData.feeds.slice(-24).map(feed => parseFloat(feed.field2) || 0);
            break;
        case 'pressure':
            value = parseFloat(latestFeed.field4) || 0;
            unit = 'hPa';
            status = getPressureStatus(value);
            title.textContent = '气压详细数据';
            trendData = currentData.feeds.slice(-24).map(feed => parseFloat(feed.field4) || 0);
            break;
        case 'airquality':
            value = parseFloat(latestFeed.field5) || 0;
            unit = 'AQI';
            status = getAirQualityStatus(value);
            title.textContent = '空气质量详细数据';
            trendData = currentData.feeds.slice(-24).map(feed => parseFloat(feed.field5) || 0);
            break;
    }
    
    const times = currentData.feeds.slice(-24).map(feed => 
        new Date(feed.created_at).toLocaleTimeString('zh-CN')
    );
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-2">当前数值</div>
                <div class="text-3xl font-bold text-gray-900 mono">${value.toFixed(1)} ${unit}</div>
                <div class="mt-2">
                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${status.color.replace('status-', 'bg-')}-100 ${status.color.replace('status-', 'text-')}-800">
                        ${status.text}
                    </span>
                </div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-2">统计信息</div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>最大值:</span>
                        <span class="font-medium">${Math.max(...trendData).toFixed(1)} ${unit}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>最小值:</span>
                        <span class="font-medium">${Math.min(...trendData).toFixed(1)} ${unit}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>平均值:</span>
                        <span class="font-medium">${(trendData.reduce((a, b) => a + b, 0) / trendData.length).toFixed(1)} ${unit}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="mb-4">
            <div class="text-sm text-gray-600 mb-2">24小时趋势</div>
            <div id="modal-chart" style="height: 300px;"></div>
        </div>
    `;
    
    // 创建详细图表
    const modalChart = echarts.init(document.getElementById('modal-chart'));
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: times,
            axisLabel: {
                rotate: 45,
                fontSize: 10
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: `{value} ${unit}`
            }
        },
        series: [{
            type: 'line',
            data: trendData,
            smooth: true,
            lineStyle: {
                color: '#0ea5e9',
                width: 3
            },
            itemStyle: {
                color: '#0ea5e9'
            },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                        offset: 0, color: 'rgba(14, 165, 233, 0.3)'
                    }, {
                        offset: 1, color: 'rgba(14, 165, 233, 0.05)'
                    }]
                }
            }
        }]
    };
    modalChart.setOption(option);
    
    modal.classList.remove('hidden');
    
    // 模态框显示动画
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuart'
    });
}

// 关闭详细数据模态框
function closeDetailModal() {
    const modal = document.getElementById('detail-modal');
    
    anime({
        targets: modal.querySelector('.bg-white'),
        scale: [1, 0.8],
        opacity: [1, 0],
        duration: 200,
        easing: 'easeInQuart',
        complete: () => {
            modal.classList.add('hidden');
        }
    });
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    if (trendChart) {
        trendChart.dispose();
    }
});

// 响应式处理
window.addEventListener('resize', () => {
    if (trendChart) {
        trendChart.resize();
    }
});