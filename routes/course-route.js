const router = require("express").Router();
const Course = require("../models").conste;
const courseVaildation = require("../validation").courseVaildation;
//"/api/courses"

router.use((req, res, next) => {
  console.log("conurse route正在接受一個request...");
  next();
});

//或得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"]) //可以透過instructor來找出"username", "email"
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用講師id找課程
router.get("/instructor/:_intructor_id", async (req, res) => {
  let { _intructor_id } = req.params;
  console.log(_intructor_id);
  let courseFound = await Course.find({ instructor: _intructor_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(courseFound);
});

//用學生id來尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  let courseFound = await Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .exec();
  return res.send(courseFound);
});

//用課程名稱搜尋課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  // console.log(_id);
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//用課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  // console.log(_id);
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    return res.status(500).send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

//新增課程
router.post("/", async (req, res) => {
  //驗證數據符合規範

  let { error } = courseVaildation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.user.isStudent()) {
    return res.status(400).send("只有講師可以發布課程");
  }
  console.log(req.body);
  let { title, description, price } = req.body;

  try {
    let newCourse = new Course({
      title,
      description,
      price,
      instructor: req.user._id,
    });
    let savedCourse = await newCourse.save();
    console.log(savedCourse);
    return res.send("新課程以保存");
  } catch (e) {
    return res.status(500).send("無法創建課程....");
  }
});

//學生透過課程id來註冊課程
router.post("/enroll/:_id", async (req, res) => {
  let = { _id } = req.params;
  console.log(_id);
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send(註冊完成);
  } catch (e) {
    return res.send(e);
  }
});

//修改課程
router.patch("/:_id", async (req, res) => {
  //驗證課程符合規範
  let { error } = courseVaildation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id });
    if (!courseFound) return res.status(400).send("找不到課程");

    //更新課程，確認是否為此課程講師
    if (courseFound.instructor.equals(req.user._id)) {
      let updataCourse = await Course.findOneAndUpdate({ _id }, req.body, {
        new: true,
        runValidators: true,
      });
      return res.send({
        message: "課程已被更新成功",
        updataCourse,
      });
    } else {
      return res.status(403).send("只有此課程老師才可以編輯課程");
    }
  } catch (e) {
    return res.status(400).send(e);
  }
});

//刪除課程
router.delete("/:_id", async (req, res) => {
  //驗證課程符合規範
  let { _id } = req.params;
  //確認課程存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) return res.status(400).send("找不到課程，無法刪除課程");

    //確認為此課程講師才能刪除課程
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程刪除成功");
    } else {
      return res.status(403).send("只有此課程老師才可以刪除課程");
    }
  } catch (e) {
    return res.status(400).send(e);
  }
});

module.exports = router;
