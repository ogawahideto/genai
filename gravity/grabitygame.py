import pygame
import sys
import math
import random

# Pygameの初期化
pygame.init()

# 画面設定
WIDTH = 800
HEIGHT = 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("重力シミュレーションゲーム")

# 色の定義
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GREEN = (0, 255, 0)

# フォント設定
try:
    FONT = pygame.font.Font("C:/Windows/Fonts/meiryo.ttc", 36)  # メイリオフォント
except:
    try:
        FONT = pygame.font.Font("C:/Windows/Fonts/msgothic.ttc", 36)  # MSゴシック
    except:
        FONT = pygame.font.Font(None, 36)  # フォールバック用

# 重力定数
G = 6.67430e-11 * 1e10  # スケールを調整

class CelestialBody:
    def __init__(self, x, y, mass, radius, color):
        self.x = x
        self.y = y
        self.mass = mass
        self.radius = radius
        self.color = color
        self.vx = 0
        self.vy = 0
        
    def draw(self):
        pygame.draw.circle(screen, self.color, (int(self.x), int(self.y)), self.radius)

class Game:
    def __init__(self, initial_velocity=0, initial_angle=0, center_bodies=None, user_mass=None, level=1):
        self.level = level
        
        # 中央の物体（複数）
        self.center_bodies = []
        if center_bodies:
            self.center_bodies = center_bodies
        else:
            for _ in range(level):
                mass = random.uniform(1e4, 1e5)
                radius = int(math.pow(mass/1e4, 1/3.0) * 20)
                # ランダムな位置（ただし、スタート地点とゴール付近は避ける）
                while True:
                    x = random.randint(200, WIDTH-200)
                    y = random.randint(100, HEIGHT-100)
                    # スタート地点とゴールから十分離れているか確認
                    if (x - 100)**2 + (y - HEIGHT//2)**2 > 150**2 and \
                       (x - (WIDTH-100))**2 + (y - HEIGHT//2)**2 > 150**2:
                        break
                self.center_bodies.append(CelestialBody(x, y, mass, radius, BLUE))
        
        # ユーザ物体
        self.user_mass = user_mass if user_mass is not None else random.uniform(1e2, 1e3)
        user_radius = int(math.pow(self.user_mass/1e2, 1/3.0) * 10)
        self.user_body = CelestialBody(100, HEIGHT//2, self.user_mass, user_radius, RED)
        
        # ゴールポイント
        self.goal = {"x": WIDTH-100, "y": HEIGHT//2, "radius": 20}
        
        self.initial_velocity = initial_velocity
        self.initial_angle = initial_angle
        self.game_state = "setup"  # setup, running, won, failed
        self.font = FONT
        self.velocity_sensitivity = 0.2
        self.angle_sensitivity = 2.0
        # 矢印の設定
        self.arrow_scale = 30  # 速度から矢印の長さへの変換係数
        self.arrow_head_size = 10  # 矢印の頭の大きさ
        
    def calculate_gravity(self):
        # すべての中央物体からの重力を合計
        total_fx = 0
        total_fy = 0
        
        for center_body in self.center_bodies:
            dx = center_body.x - self.user_body.x
            dy = center_body.y - self.user_body.y
            distance = math.sqrt(dx*dx + dy*dy)
            
            # 衝突判定
            if distance < (center_body.radius + self.user_body.radius):
                self.game_state = "failed"
                return
                
            force = G * center_body.mass * self.user_body.mass / (distance * distance)
            angle = math.atan2(dy, dx)
            
            total_fx += force * math.cos(angle)
            total_fy += force * math.sin(angle)
        
        self.user_body.vx += total_fx / self.user_body.mass
        self.user_body.vy += total_fy / self.user_body.mass
        
    def update(self):
        if self.game_state == "running":
            self.calculate_gravity()
            self.user_body.x += self.user_body.vx
            self.user_body.y += self.user_body.vy
            
            # 画面外判定
            if (self.user_body.x < 0 or self.user_body.x > WIDTH or 
                self.user_body.y < 0 or self.user_body.y > HEIGHT):
                self.game_state = "failed"
                return
            
            # ゴール判定
            dx = self.user_body.x - self.goal["x"]
            dy = self.user_body.y - self.goal["y"]
            if math.sqrt(dx*dx + dy*dy) < self.goal["radius"]:
                self.game_state = "won"
                
    def draw_arrow(self):
        # 矢印の始点（ユーザ物体の中心）
        start_x = self.user_body.x
        start_y = self.user_body.y
        
        # 矢印の方向と長さを計算
        angle_rad = math.radians(self.initial_angle)
        arrow_length = self.initial_velocity * self.arrow_scale
        
        # 矢印の終点
        end_x = start_x + arrow_length * math.cos(angle_rad)
        end_y = start_y + arrow_length * math.sin(angle_rad)
        
        # 矢印の本体を描画
        pygame.draw.line(screen, WHITE, (start_x, start_y), (end_x, end_y), 2)
        
        # 矢印の頭を描画
        if arrow_length > 0:
            # 矢印の頭の角度（45度）
            head_angle1 = angle_rad + math.radians(135)
            head_angle2 = angle_rad - math.radians(135)
            
            # 矢印の頭の頂点
            head_x1 = end_x + self.arrow_head_size * math.cos(head_angle1)
            head_y1 = end_y + self.arrow_head_size * math.sin(head_angle1)
            head_x2 = end_x + self.arrow_head_size * math.cos(head_angle2)
            head_y2 = end_y + self.arrow_head_size * math.sin(head_angle2)
            
            # 矢印の頭を描画
            pygame.draw.polygon(screen, WHITE, [
                (end_x, end_y),
                (head_x1, head_y1),
                (head_x2, head_y2)
            ])
        
    def draw(self):
        screen.fill(BLACK)
        
        # すべての中央物体を描画
        for body in self.center_bodies:
            body.draw()
        self.user_body.draw()
        
        # ゴールの描画
        pygame.draw.circle(screen, GREEN, (self.goal["x"], self.goal["y"]), self.goal["radius"])
        
        if self.game_state == "setup":
            # 矢印を描画
            self.draw_arrow()
            
            # 初速度と角度の表示
            velocity_text = self.font.render(f"初速度: {self.initial_velocity:.1f}", True, WHITE)
            angle_text = self.font.render(f"角度: {self.initial_angle:.1f}度", True, WHITE)
            level_text = self.font.render(f"レベル: {self.level}", True, WHITE)
            screen.blit(velocity_text, (10, 10))
            screen.blit(angle_text, (10, 50))
            screen.blit(level_text, (10, 90))
            
        elif self.game_state == "won":
            win_text = self.font.render("クリア！", True, WHITE)
            screen.blit(win_text, (WIDTH//2 - 50, HEIGHT//2))
            retry_text = self.font.render("Rキーで次のレベル", True, WHITE)
            screen.blit(retry_text, (WIDTH//2 - 120, HEIGHT//2 + 40))
            
        elif self.game_state == "failed":
            fail_text = self.font.render("失敗！", True, WHITE)
            screen.blit(fail_text, (WIDTH//2 - 50, HEIGHT//2))
            retry_text = self.font.render("Rキーでリトライ", True, WHITE)
            screen.blit(retry_text, (WIDTH//2 - 100, HEIGHT//2 + 40))

def main():
    clock = pygame.time.Clock()
    game = Game()
    
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
                
            if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE and game.game_state == "setup":
                angle_rad = math.radians(game.initial_angle)
                game.user_body.vx = game.initial_velocity * math.cos(angle_rad)
                game.user_body.vy = game.initial_velocity * math.sin(angle_rad)
                game.game_state = "running"
                    
            if event.type == pygame.KEYDOWN and event.key == pygame.K_r:
                if game.game_state == "won":
                    # 成功時は新しい質量で次のレベルを作成
                    game = Game(game.initial_velocity, game.initial_angle, level=game.level + 1)
                else:
                    # 失敗時は同じ質量と配置で再チャレンジ
                    game = Game(game.initial_velocity, game.initial_angle, 
                              game.center_bodies, game.user_mass, game.level)
        
        # 連続入力の処理
        if game.game_state == "setup":
            keys = pygame.key.get_pressed()
            if keys[pygame.K_UP]:
                game.initial_velocity += game.velocity_sensitivity
            if keys[pygame.K_DOWN]:
                game.initial_velocity = max(0, game.initial_velocity - game.velocity_sensitivity)
            if keys[pygame.K_RIGHT]:
                game.initial_angle += game.angle_sensitivity
                if game.initial_angle >= 360:
                    game.initial_angle -= 360
            if keys[pygame.K_LEFT]:
                game.initial_angle -= game.angle_sensitivity
                if game.initial_angle < 0:
                    game.initial_angle += 360
                
        game.update()
        game.draw()
        pygame.display.flip()
        clock.tick(60)

if __name__ == "__main__":
    main()
