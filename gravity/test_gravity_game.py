import unittest
import math
from grabitygame import Game, CelestialBody, WIDTH, HEIGHT

class TestGravityGame(unittest.TestCase):
    def setUp(self):
        """各テストケース実行前の準備"""
        self.game = Game()

    def test_initial_state(self):
        """初期状態のテスト"""
        self.assertEqual(self.game.initial_velocity, 0)
        self.assertEqual(self.game.initial_angle, 0)
        self.assertEqual(self.game.level, 1)
        self.assertEqual(self.game.game_state, "setup")
        self.assertEqual(len(self.game.center_bodies), 1)  # レベル1なので中央物体は1つ

    def test_celestial_body_creation(self):
        """天体オブジェクトの生成テスト"""
        body = CelestialBody(100, 100, 1000, 10, (255, 0, 0))
        self.assertEqual(body.x, 100)
        self.assertEqual(body.y, 100)
        self.assertEqual(body.mass, 1000)
        self.assertEqual(body.radius, 10)
        self.assertEqual(body.vx, 0)
        self.assertEqual(body.vy, 0)

    def test_velocity_input(self):
        """速度入力のテスト"""
        initial_velocity = self.game.initial_velocity
        self.game.initial_velocity += self.game.velocity_sensitivity
        self.assertGreater(self.game.initial_velocity, initial_velocity)
        
        # 負の速度にならないことを確認
        self.game.initial_velocity = 0
        self.game.initial_velocity = max(0, self.game.initial_velocity - self.game.velocity_sensitivity)
        self.assertEqual(self.game.initial_velocity, 0)

    def test_angle_input(self):
        """角度入力のテスト"""
        # 角度が360度で循環することを確認
        self.game.initial_angle = 359
        self.game.initial_angle += self.game.angle_sensitivity
        self.assertLess(self.game.initial_angle, 360)
        
        self.game.initial_angle = 0
        self.game.initial_angle -= self.game.angle_sensitivity
        self.assertGreaterEqual(self.game.initial_angle, 0)

    def test_collision_detection(self):
        """衝突判定のテスト"""
        # ユーザ物体を中央物体に近づける
        self.game.user_body.x = self.game.center_bodies[0].x
        self.game.user_body.y = self.game.center_bodies[0].y
        self.game.calculate_gravity()
        self.assertEqual(self.game.game_state, "failed")

    def test_goal_detection(self):
        """ゴール判定のテスト"""
        # ユーザ物体をゴールに移動
        self.game.user_body.x = self.game.goal["x"]
        self.game.user_body.y = self.game.goal["y"]
        self.game.game_state = "running"  # 実行中状態に設定
        self.game.update()
        self.assertEqual(self.game.game_state, "won")

    def test_out_of_bounds(self):
        """画面外判定のテスト"""
        # 画面外に移動
        self.game.user_body.x = WIDTH + 1
        self.game.game_state = "running"
        self.game.update()
        self.assertEqual(self.game.game_state, "failed")

    def test_gravity_calculation(self):
        """重力計算のテスト"""
        # 初期位置を記録
        initial_x = self.game.user_body.x
        initial_y = self.game.user_body.y
        
        # 物体を動かす
        self.game.game_state = "running"
        self.game.user_body.vx = 1
        self.game.user_body.vy = 0
        self.game.update()
        
        # 重力の影響で初期位置から移動していることを確認
        self.assertNotEqual(self.game.user_body.x, initial_x)
        self.assertNotEqual(self.game.user_body.vy, 0)  # 重力で垂直方向の速度が発生

    def test_level_progression(self):
        """レベル進行のテスト"""
        current_level = self.game.level
        new_game = Game(level=self.game.level + 1)
        self.assertEqual(new_game.level, current_level + 1)
        self.assertEqual(len(new_game.center_bodies), current_level + 1)

if __name__ == '__main__':
    unittest.main() 