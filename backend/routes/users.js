const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const userInit = (dbase, privateKey) => {

  // ======================
  // LOGIN
  // ======================
  router.post('/login', (req, res) => {

    console.log('/login =>', req.body);

    const { userName, password } = req.body;

    dbase.readDocument({
      collection: 'User',
      query: JSON.stringify({ userName: userName }),
    }, (err, resp) => {

      let user = { userName: '' };

      if (resp) {
        const temp = JSON.parse(resp.data);
        if (temp.length) user = temp[0];
      } else {
        return res.json({
          text: 'Users database error!',
          token: null,
        });
      }

      if (user.userName === '') {
        return res.json({
          text: 'Username not found!',
          token: null,
        });
      }

      bcrypt.compare(password, user.password).then(isMatch => {

        if (!isMatch) {
          return res.json({
            text: 'Username or password incorrect!',
            token: null,
          });
        }

        const payload = {
          _id: user._id,
          userName: user.userName,
          userLevel: user.userLevel,
          userState: user.userState,
        };

        jwt.sign(
          payload,
          privateKey,
          { expiresIn: 60 * 60 * 24 },
          (err, token) => {

            if (err) {
              return res.json({
                text: 'There is some error in token!',
                token: null,
              });
            }

            let text = 'Login success!';
            if (user.userState === 'waiting') {
              text = 'Your account is not confirm!';
            }

            return res.json({
              text: text,
              token: `Bearer ${token}`,
            });
          }
        );
      });
    });
  });

  // ======================
  // GET ME
  // ======================
  router.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {

      console.log('/me ->', req.user);

      if (!req.user.text) {
        return res.json({
          _id: req.user._id,
          displayName: req.user.userLevel,
          userName: req.user.userName,
          email: req.user.email,
          text: '',
        });
      }

      return res.json({
        text: 'Token error!',
      });
    }
  );

 // ======================
// ADMIN RESET PASSWORD
// ======================
router.put(
  '/admin/reset-password/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {

    console.log('/admin/reset-password =>', req.body);

    // ✅ เช็กสิทธิ์ admin
    if (req.user.userLevel !== 'admin') {
      return res.status(403).json({
        text: 'Permission denied (admin only)',
      });
    }

    const userId = req.params.id;
    const { newPassword, confirmNewPassword } = req.body;

    // ✅ validate input
    if (!newPassword || !confirmNewPassword) {
      return res.json({
        text: 'New password and confirm password are required!',
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.json({
        text: 'Passwords do not match!',
      });
    }

    if (newPassword.length < 8) {
      return res.json({
        text: 'Password must be at least 8 characters!',
      });
    }

    // ✅ hash password ใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ update password
    dbase.updateDocument({
      collection: 'User',
      query: JSON.stringify({ _id: userId }),
      data: JSON.stringify({
        password: hashedPassword,
        passwordUpdatedAt: new Date(),
        forceReset: true, // (optional) ไว้บังคับ user เปลี่ยนรหัสตอน login
      }),
    }, (err, resp) => {

      if (err) {
        return res.json({
          text: 'Reset password failed!',
        });
      }

      return res.json({
        text: 'Admin reset password successfully!',
      });
    });
  }
);
}

module.exports = {
  userInit: userInit,
  router: router,
};
