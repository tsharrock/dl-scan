// app module
var dlScan = angular.module('dlScan', []);

dlScan.run(['$rootScope', function($rootScope) {
    $rootScope.applicant = {
        'Address': {
            'State': '',
            'Line1': '',
            'Line2': '',
            'City': '',
            'Zip': '',
            'Residence': {
                'YearsAtAddress': '',
                'MonthsAtAddress': ''
            }
        }
    };
}]);

dlScan.controller('StartController', function($scope, $rootScope, $timeout) {
    $scope.steps = {
        active: 1
    };
    $scope.msg = "";
    angular.element("#scanModal").modal('show');
    $scope.dlString = "";
    // $scope.dlString3 = "@ANSI 636040070002DL00410307ZU03480012DLDAQ0157933645DCSSHARROCKDDEUDACTHOMASDDFUDADWILLIAMDDGUDCADDCBBDCDNONEDBD06222015DBB05211973DBA05212020DBC1DAU075 inDAYBLUDAG13547 S CHAMONIX WAYDAIRIVERTONDAJUTDAK840650000  DCF1_6302015DCGUSADCK01579336450101DDAFDDB01012013DAW220DAZBLNDDH05211991DDI05211992DDJ05211994DDK1ZUZUAYZUBZ";
    var DLSections = "DAQ|DAA|DAG|DAI|DAJ|DAK|DAR|DAS|DAT|DAU|DAW|DAY|DAZ|DBA|DBK|DBB|DBC|DBD|DCT|DCS|DAD|DDE|DDF";
    /* Driver's License delimiters
        DAQ: License Number
        DAA: Name
        DCT or DAC: First Name
        DCS: Last Name
        DAD: Middle Name
        DAG: Address
        DAI: City
        DAJ: State Code
        DAK: Zip code
        DAR: Class
        DAS: Restriction
        DAT: Endorsement
        DAU: Height
        DAW: Weight
        DAY: Eye Color
        DAZ: Hair Color
        DBA: Expiration Date
        DBK: Social Security Number
        DBB: Date of Birth
        DBC: Gender
        DBD: Date of Issue
    */
    var changeCount = 0;
    $scope.$watch('dlString', function() {
        if (changeCount === 1) {
            $scope.msg = "Scan complete, loading your information...";
            $timeout(function() {
                if ($scope.dlString.length < 50) {
                    $scope.msg = "Scan incomplete due to error, please scan again.";
                    changeCount = 0;
                    $scope.dlString = "";
                    return false;
                } else {
                    parseDL();
                }
            }, 5000);
        }
        changeCount++;
    });

    function parseDL() {
        $scope.msg = "Data loaded!";
        $scope.$apply();
        var STRING = $scope.dlString.toString();
        var FullName = $scope.dlString.match("DAA(.*?)(" + DLSections + ")");
        if (FullName) {
            var full = FullName[1].split(',');
            $scope.applicant.FirstName = full[1];
            $scope.applicant.LastName = full[0];
        } else {
            var FirstName = $scope.dlString.match("DCT(.*?)(" + DLSections + ")");
            if (FirstName) {
                $scope.applicant.FirstName = FirstName[1];
            } else {
                var fName = $scope.dlString.match("DAC(.*?)(" + DLSections + ")");
                $scope.applicant.FirstName = fName[1];
            }
            var LastName = STRING.match("DCS(.*?)(" + DLSections + ")");
            $scope.applicant.LastName = LastName[1];
        }
        //suffix jr,...
        var SUF = STRING.match("DCU(.*?)(" + DLSections + ")");
        if (SUF) {
            $scope.applicant.LastName = $scope.applicant.LastName + " " + SUF[1];
        }
        
        var Address = STRING.match("DAG(.*?)(" + DLSections + ")");
        $scope.applicant.Address.Line1 = Address[1];
        var City = STRING.match("DAI(.*?)(" + DLSections + ")");
        $scope.applicant.Address.City = City[1];
        var State = STRING.match("DAJ(.*?)(" + DLSections + ")");
        $scope.applicant.Address.State = State[1];
        var Zip = STRING.match("DAK(.*?)(" + DLSections + ")");
        $scope.applicant.Address.Zip = Zip[1].substring(0, 5);
        var Dob = STRING.match("DBB(.*?)(" + DLSections + ")");
        var mm = Dob[1].substring(0, 2);
        var dd = Dob[1].substring(2, 4);
        var yyyy = Dob[1].substring(4, 8);
        $scope.applicant.DateOfBirth = mm + "/" + dd + "/" + yyyy;
        //social
        var SSN = STRING.match("DBK(.*?)(" + DLSections + ")");
        if (SSN) {
            $scope.applicant.SSN = SSN[1];
        }

        $timeout.cancel();
        angular.element("#scanModal").modal('hide');
    }

    $scope.moveNext = function() {
        $scope.steps.active = $scope.steps.active + 1;
    };

    $scope.moveBack = function() {
        $scope.steps.active = $scope.steps.active - 1;
    };
});
