var ProfileManager = (function () {
    var storageKey = "New Profile Info";
    var consoleKey = 0

    var ifCheck = (x) => {
        var accepted = x === undefined || x === null ? 0 : x;
        return accepted;
    }
    
    var ifCheckElse = (x,y) => {
        var accepted = x === undefined || x === null ? ifCheck(y) : x;
        return accepted;
    }

    var tempProfile = JSON.parse(window.localStorage.getItem(storageKey));
    this.savedProfileInfo =
        tempProfile === undefined || tempProfile === null ? 0 : tempProfile;
    if (this.savedProfileInfo != 0){
        console.log("Saved Info: " + savedProfileInfo.toString());
    }

    //base variable
    this.athlete = {
        baseInfo:{
        }, 
        startingStats:{
        },
        currentStats:{
        }
    }

    if(this.savedProfileInfo.athlete)
    {
        athlete = {
            baseInfo: {
                fName: this.savedProfileInfo.athlete.baseInfo.fName,
                lName: this.savedProfileInfo.athlete.baseInfo.lName,
                //used in BMI calculation since its different between biological males and bilogical females. 
                sex: this.savedProfileInfo.athlete.baseInfo.sex,
                heightFt: this.savedProfileInfo.athlete.baseInfo.heightFt,
                heightIn: this.savedProfileInfo.athlete.baseInfo.heightIn,
                age: this.savedProfileInfo.athlete.baseInfo.age,
                goalWeight: this.savedProfileInfo.athlete.baseInfo.goalWeight,
            },
            startingStats: {
                weight: this.savedProfileInfo.athlete.startingStats.weight,
                bodyFat: this.savedProfileInfo.athlete.startingStats.bodyFat,
                bodyMassIndex: this.savedProfileInfo.athlete.startingStats.bodyMassIndex,
                startingImageLink: 0//how the funk do i do this?!
            },
            currentStats : {
                weight: this.savedProfileInfo.athlete.currentStats.weight,
                bodyFat: this.savedProfileInfo.athlete.currentStats.bodyFat,
                bodyMassIndex: this.savedProfileInfo.athlete.currentStats.bodyMassIndex,
                currentImageLink: 0//how the funk do i do this?! imgur maybe
            }
        }
    } else 
    {
        athlete = {
            baseInfo: {
                fName: "first name",
                lName: "last name",
                //used in BMI calculation since its different between biological males and bilogical females. 
                sex: "sex",
                heightFt: "ft",
                heightIn: "in",
                age: "age",
                goalWeight: "weight",
            },
            startingStats: {
                weight: 0,
                bodyFat: 0,
                bodyMassIndex: 0,
                startingImageLink: 0//how the funk do i do this?!
            },
            currentStats : {
                weight: 0,
                bodyFat: 0,
                bodyMassIndex: 0,
                startingImageLink: 0//how the funk do i do this?!
            }
        }
    }




    var tmp = savedProfileInfo;

    if(tmp.currentStats){
        var height = parseFloat(tmp.currentStats.heightFt * 12) + parseFloat(tmp.currentStats.heightIn);
        var weight = parseFloat(tmp.currentStats.weight);
    }else if (tmp.startingStats) {
        var height = parseFloat(tmp.startingStats.heightFt * 12) + parseFloat(tmp.startingStats.heightIn);
        var weight = parseFloat(tmp.startingStats.weight);
    } else {
        var height = 0;
        var weight = 0;
    }

    var bodyMassIndexCalc = ((weight / (height * height)) * 703);

    var bmiClass = document.getElementById("profile_body_mass_index");

    //function to set color of class for BMI 
    var setBmiClassColor = (tempBmiCalc) => {
        if (tempBmiCalc >= 30.00 || tempBmiCalc < 15) {
            console.log("Downloading this app is a great start but you may need to see a professional about weight gain or loss. Keep your chin up!")
            //color : red
            bmiClass.style.color = '#9e0000';
        } else if (tempBmiCalc >= 25.00) {
            console.log("Way to go, Try creating and testing a custom workout!")
            //color : yellow
            bmiClass.style.color = '#f4d142';
        } else if (tempBmiCalc >= 18.50) {
            console.log("Good job! BMI isnt everything though, make sure you exercise regularly")
            //color : green
            bmiClass.style.color = 'green';
        } else {
            console.log("Uh Oh");
            //color : red
            bmiClass.style.color = '#f4d142';
        };
    }

    //function to show info that we have saved if any
    var displayinfo = profile => {
        // eventually make the label phase out nicely
        document.getElementById("profile_fieldFName").value = ifCheck(profile.baseInfo) == 0 ? "first name" : profile.baseInfo.fName;
        document.getElementById("profile_fieldLName").value = ifCheck(profile.baseInfo) == 0 ? "last name" : profile.baseInfo.lName;
        document.getElementById("profile_fieldHeightFt").value = ifCheck(profile.baseInfo) == 0 ? "feet" : profile.baseInfo.heightFt;
        document.getElementById("profile_fieldHeightIn").value = ifCheck(profile.baseInfo) == 0 ? "inch" : profile.baseInfo.heightIn;
        document.getElementById("profile_fieldGoalWeight").value = ifCheck(profile.baseInfo) == 0 ? "goal" : profile.baseInfo.goalWeight;
        document.getElementById("profile_fieldWeight").value = ifCheckElse(profile.currentStats,profile.startingStats) ==0 ? "0" : ifCheckElse(profile.currentStats.weight,profile.startingStats.weight);
        document.getElementById("profile_fieldAge").value = ifCheck(profile.baseInfo) == 0 ? "age" : profile.baseInfo.age;
        document.getElementById("profile_fieldBodyfat").value = ifCheckElse(profile.currentStats,profile.startingStats) ==0 ? "0" : ifCheckElse(profile.currentStats.bodyFat,profile.startingStats.bodyFat);
        document.getElementById("profile_body_mass_index").textContent = Math.round(ifCheckElse(profile.currentStats,profile.startingStats) ==0 ? "0" :ifCheckElse(profile.currentStats.bodyMassIndex,profile.startingStats.bodyMassIndex) * 100) / 100//String(profile.fBodyMassIndex).substr(0, 6);
        setBmiClassColor(Math.round(ifCheckElse(profile.currentStats,profile.startingStats) ==0 ? "0" :ifCheckElse(profile.currentStats.bodyMassIndex,profile.startingStats.bodyMassIndex) * 100) / 100);
    };

    displayinfo(ifCheck(this.savedProfileInfo));

    this.saveInfo = (storKey, fields) => {
        window.localStorage.setItem(storKey, fields);
    };

    this.changeInfo = () => {
        this.athlete.baseInfo = {
            fName: document.getElementById("profile_fieldFName").value,
            lName: document.getElementById("profile_fieldLName").value,
            heightFt: document.getElementById("profile_fieldHeightFt").value,
            heightIn: document.getElementById("profile_fieldHeightIn").value,
            age: document.getElementById("profile_fieldAge").value,
            goalWeight: document.getElementById("profile_fieldGoalWeight").value,
            //split based on if starting exists, if so change button to update and show starting somehow. 
        };

        
        var tmpheight = parseFloat(this.athlete.baseInfo.heightFt * 12) + parseFloat(this.athlete.baseInfo.heightIn);
        var tmpweight = parseFloat(document.getElementById("profile_fieldWeight").value);

        var bmiCalc = ((tmpweight / (tmpheight * tmpheight)) * 703);
        console.log("ChangeInfo: ", bmiCalc);

        if (this.athlete.startingStats.weight != 0)
        {
            this.athlete.currentStats = {
                weight: document.getElementById("profile_fieldWeight").value,
                bodyFat: document.getElementById("profile_fieldBodyfat").value,
                bodyMassIndex: String(bmiCalc)
            }
        } else {
            
            this.athlete.startingStats = {
                weight: document.getElementById("profile_fieldWeight").value,
                bodyFat: document.getElementById("profile_fieldBodyfat").value,
                bodyMassIndex: String(bmiCalc)
            }
            this.athlete.currentStats = {
                weight: document.getElementById("profile_fieldWeight").value,
                bodyFat: document.getElementById("profile_fieldBodyfat").value,
                bodyMassIndex: String(bmiCalc)
            }
        }

        console.log(this.athlete);
        this.saveInfo(storageKey, JSON.stringify(this.athlete));
        displayinfo(ifCheck(this.athlete));
    };

    return {
        displayInfo: this.displayInfo,
        changeInfo: this.changeInfo,
        saveInfo: this.saveInfo,
        setBmiClassColor: this.setBmiClassColor

    };
})();
